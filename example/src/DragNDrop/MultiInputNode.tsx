import React, { memo, FC, CSSProperties } from 'react';

import { Handle, Position, NodeProps, } from 'react-flow-renderer';

const targetHandleStyle: CSSProperties = { background: '#555' };
const sourceHandleStyleA: CSSProperties = { ...targetHandleStyle, top: 10 };
const sourceHandleStyleB: CSSProperties = { ...targetHandleStyle, bottom: 10, top: 'auto' };
const sourceHandleStyleC: CSSProperties = { ...targetHandleStyle, bottom: 20, top: 'auto' };

const MultiInputNode: FC<NodeProps> = ({ isConnectable }) => {
  return (
    <>
      <div>
        Multi Input Node
      </div>
      <Handle
        type="source"
        dataType='scalar'
        position={Position.Right}
        id="multiInput:input-source-1"
        style={sourceHandleStyleA}
        isConnectable={isConnectable}
      />
      <Handle type="source" dataType='scalar' position={Position.Right} id="multiInput:input-source-2" style={sourceHandleStyleB} isConnectable={isConnectable} />
      <Handle type="source" dataType='scalar' position={Position.Right} id="multiInput:input-source-3" style={sourceHandleStyleC} isConnectable={isConnectable} />
    </>
  );
};

export default memo(MultiInputNode);

