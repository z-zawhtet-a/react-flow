import React, { memo, FC, CSSProperties } from 'react';

import { Handle, Position, NodeProps, } from 'react-flow-renderer';

const targetHandleStyle: CSSProperties = { background: '#555' };
const targetHandleStyleA: CSSProperties = { ...targetHandleStyle, top: 10 };
const targetHandleStyleB: CSSProperties = { ...targetHandleStyle, bottom: 10, top: 'auto' };
const targetHandleStyleC: CSSProperties = { ...targetHandleStyle, bottom: 20, top: 'auto' };

const MultiOutputNode: FC<NodeProps> = ({ isConnectable }) => {
  return (
    <>
      <div>
        Multi Output Node
      </div>
      <Handle
        type="target"
        dataType='scalar'
        position={Position.Left}
        id="multiOutput:output-target-1"
        style={targetHandleStyleA}
        isConnectable={isConnectable}
      />
      <Handle type="target" dataType='scalar' position={Position.Left} id="multiOutput:output-target-2" style={targetHandleStyleB} isConnectable={isConnectable} />
      <Handle type="target" dataType='scalar' position={Position.Left} id="multiOutput:output-target-3" style={targetHandleStyleC} isConnectable={isConnectable} />
    </>
  );
};

export default memo(MultiOutputNode);
