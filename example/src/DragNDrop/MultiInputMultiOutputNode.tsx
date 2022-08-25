import React, { memo, FC, CSSProperties } from 'react';

import { Handle, Position, NodeProps, } from 'react-flow-renderer';

const targetHandleStyle: CSSProperties = { background: '#555' };
const sourceHandleStyleA: CSSProperties = { ...targetHandleStyle, top: 10 };
const sourceHandleStyleB: CSSProperties = { ...targetHandleStyle, bottom: 10, top: 'auto' };
const sourceHandleStyleC: CSSProperties = { ...targetHandleStyle, bottom: 20, top: 'auto' };
const targetHandleStyleA: CSSProperties = { ...targetHandleStyle, top: 10 };
const targetHandleStyleB: CSSProperties = { ...targetHandleStyle, bottom: 10, top: 'auto' };
const targetHandleStyleC: CSSProperties = { ...targetHandleStyle, bottom: 20, top: 'auto' };

const MultiInputMultiOutputNode: FC<NodeProps> = ({ isConnectable }) => {
  return (
    <>
      <div>
        Multi Input Multi Output Node
      </div>
      <Handle
        type="source"
        dataType='scalar'
        position={Position.Right}
        id={`${Math.round(Math.random()*1000)}_multiInputOutput:input-source-1`}
        style={sourceHandleStyleA}
        isConnectable={isConnectable}
      />
      <Handle type="source" dataType='scalar' position={Position.Right}
        id={`${Math.round(Math.random()*1000)}_multiInputOutput:input-source-2`} style={sourceHandleStyleB} isConnectable={isConnectable} />
      <Handle type="source" dataType='scalar' position={Position.Right}
        id={`${Math.round(Math.random()*1000)}_multiInputOutput:input-source-3`} style={sourceHandleStyleC} isConnectable={isConnectable} />
      <Handle
        type="target"
        dataType='scalar'
        position={Position.Left}
        id={`${Math.round(Math.random()*1000)}_multiInputOutput:output-target-1`}
        style={targetHandleStyleA}
        isConnectable={isConnectable}
      />
      <Handle type="target" dataType='scalar' position={Position.Left} id={`${Math.round(Math.random()*1000)}_multiInputOutput:output-target-2`} style={targetHandleStyleB} isConnectable={isConnectable} />
      <Handle type="target" dataType='scalar' position={Position.Left} id={`${Math.round(Math.random()*1000)}_multiInputOutput:output-target-3`} style={targetHandleStyleC} isConnectable={isConnectable} />
    </>
  );
};

export default memo(MultiInputMultiOutputNode);
