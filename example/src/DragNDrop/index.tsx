import { useState, DragEvent, useEffect, useCallback } from 'react';
import ReactFlow, {
  addEdge,
  Controls,
  ReactFlowInstance,
  Connection,
  Edge,
  Node,
  useNodesState,
  useEdgesState,
  useStore,
  HandleData
} from 'react-flow-renderer';
import _ from 'lodash';

import Sidebar from './Sidebar';

import './dnd.css';
import MultiInputNode from './MultiInputNode';
import MultiOutputNode from './MultiOutputNode';
import MultiInputMultiOutputNode from './MultiInputMultiOutputNode';

const initialNodes: Node[] = [{ id: '1', type: 'input', data: { label: 'input node' }, position: { x: 250, y: 5 } }];

const onDragOver = (event: DragEvent) => {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
};

const weights = { 'input:default': 4, 'default:default': 3, 'default:output': 2, 'input:output': 1 };

const nodeTypes = {
  "multiInput:input": MultiInputNode,
  "multiOutput:output": MultiOutputNode,
  "multiInputOutput:default": MultiInputMultiOutputNode,
}

const DnDFlow = () => {
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance>();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [pyodide, setPyodide] = useState(null);
  const sourceHandles = useStore(s => s.sourceHandles);
  const targetHandles = useStore(s => s.targetHandles);
  const [candidateSources, setCandidateSources] = useState<HandleData[]>([]);
  const [candidateTargets, setCandidateTargets] = useState<HandleData[]>([]);

  const onConnect = (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds));
  const onInit = (rfi: ReactFlowInstance) => setReactFlowInstance(rfi);

  const onDrop = (event: DragEvent) => {
    event.preventDefault();

    if (reactFlowInstance) {
      const type = event.dataTransfer.getData('application/reactflow');
      const position = reactFlowInstance.project({ x: event.clientX, y: event.clientY - 40 });
      const newNode: Node = {
        id: `dndnode_${nodes.length + 1}`,
        type: type,
        position,
        data: { label: `${type} node` },
      };

      setNodes((nds) => nds.concat(newNode));
    }
  };

  useEffect(() => {
    setCandidateSources(
      sourceHandles.filter(sh => edges.every(e => e.sourceHandle !== sh.id)))
    setCandidateTargets(
      targetHandles.filter(th => edges.every(e => e.targetHandle !== th.id)))
    edges.forEach(edge => console.log('edges: ', edge.sourceHandle, edge.targetHandle));
  }, [sourceHandles, targetHandles, edges]);

  useEffect(() => {
    // @ts-expect-error
    Promise.resolve(loadPyodide())
      .then(pyodide => setPyodide(pyodide))
  }, [])

  useEffect(() => {
    if (pyodide)
    {
      // @ts-expect-error
      Promise.resolve(pyodide.loadPackage(['networkx']))
    }
  }, [pyodide])

  const maxWeightMatching = useCallback((s: string[], t: string[], w: number[]): [string, string][] => {
    if (pyodide) {
      // @ts-expect-error
      let max_weight_matching = pyodide.runPython(`
                from pyodide.ffi import to_js
                import networkx as nx

                def max_weight_matching(s, t, w):
                    edges =  [(s[i], t[i], w[i]) for i in range(len(s))]
                    G = nx.Graph()
                    G.add_weighted_edges_from(edges)
                    matches = sorted(nx.max_weight_matching(G))
                    return to_js(matches)
                max_weight_matching
            `);
      return max_weight_matching(s, t, w);
    }
    return []
  }, [pyodide])

  useEffect(() => {
    console.log('candidate sources: ', candidateSources);
    console.log('candidate targets: ', candidateTargets);
    const validTargets = candidateSources.map(
      cs => candidateTargets.filter(
        ct => (cs.dataType === ct.dataType) && (cs.parentId  !== ct.parentId)));
    console.log('valid targets: ', validTargets);
    // console.log('unique targets: ', _.uniq(validTargets));
    const validPairs = _.zip(candidateSources, validTargets)
                        .filter((p) => p[0] && p[1]?.length)
                        .map(p => p[1]?.map(t => [p[0], t]))
                        .flatMap(p => p)
                        .filter(p => p && p[0] && p[1]) as [HandleData, HandleData][];
    console.log('valid pairs: ', validPairs);

    validPairs.map(p => {
      const sourceParent = p[0].parentId;
      const targetParent = p[1].parentId;
      const popIdx = validPairs.findIndex(p2 => p2[0]?.parentId === targetParent && p2[1]?.parentId === sourceParent); 
      if (popIdx !== -1) {
        validPairs.splice(popIdx, 1);
        return popIdx;
      }
      return null;
    })
    console.log('after removing cyclic connections: ', validPairs);

    const candidateEdges = validPairs.map((p) => {
      const source = p[0];
      const target = p[1];
      let sourceParentType: string;
      let targetParentType: string;
      if (source?.parentType.split(':').length > 1) {
        sourceParentType = source.parentType.split(':')[1];
      } else {
        sourceParentType = source.parentType;
      }

      if (target?.parentType.split(':').length > 1) {
        targetParentType = target.parentType.split(':')[1];
      } else {
        targetParentType = target.parentType;
      }

      const key = `${sourceParentType}:${targetParentType}`;
      const weight = weights[key as keyof typeof weights];
      return [source, target, weight]
    }) as [HandleData, HandleData, number][];
    console.log('validEdges: ', candidateEdges);

    if (candidateEdges.length > 0) {
      const matches = maxWeightMatching(
        candidateEdges.map(e => e[0].id),
        candidateEdges.map(e => e[1].id),
        candidateEdges.map(e => e[2]));
      console.log('matches: ', matches);
      if (matches.length > 0) {
        const finalEdges = matches.map(m => {
          if (m[0].split('-')[1] === 'source') {
            return m;
          } else {
            return [m[1], m[0]];
          }
        })
        console.log('edges: ', finalEdges);
        finalEdges.forEach(e => {
          const connection = candidateEdges.find(ce => ce[0].id === e[0] && ce[1].id === e[1]);
          if (connection) {
            const [s, t] = connection;
            onConnect({ source: s.parentId, target: t.parentId, sourceHandle: s.id, targetHandle: t.id });
          }
        })
      }
    }

  }, [candidateSources, candidateTargets])

  return (
    <div className="dndflow">
      <div className="reactflow-wrapper">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onEdgesChange={onEdgesChange}
          onNodesChange={onNodesChange}
          onConnect={onConnect}
          onInit={onInit}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
        >
          <Controls />
        </ReactFlow>
      </div>
      <Sidebar />
    </div>
  );
};

export default DnDFlow;
