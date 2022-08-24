import { useState, DragEvent, useEffect } from 'react';
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

import Sidebar from './Sidebar';

import './dnd.css';

const initialNodes: Node[] = [{ id: '1', type: 'input', data: { label: 'input node' }, position: { x: 250, y: 5 } }];

const onDragOver = (event: DragEvent) => {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
};

let id = 0;
const getId = () => `dndnode_${id++}`;

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
        id: getId(),
        type,
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

  useEffect(() => {
    console.log('candidate sources: ', candidateSources);
    console.log('candidate targets: ', candidateTargets);
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
        >
          <Controls />
        </ReactFlow>
      </div>
      <Sidebar />
    </div>
  );
};

export default DnDFlow;
