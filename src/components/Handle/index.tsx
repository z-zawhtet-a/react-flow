import React, { memo, useContext, HTMLAttributes, forwardRef } from 'react';
import cc from 'classcat';
import shallow from 'zustand/shallow';

import { useStore, useStoreApi } from '../../store';
import NodeIdContext from '../../contexts/NodeIdContext';
import { HandleProps, Connection, ReactFlowState, Position } from '../../types';
import { checkElementBelowIsValid, handleMouseDown } from './handler';
import { getHostForElement } from '../../utils';
import { addEdge } from '../../utils/graph';

const alwaysValid = () => true;

export type HandleComponentProps = HandleProps & Omit<HTMLAttributes<HTMLDivElement>, 'id'>;

const selector = (s: ReactFlowState) => ({
  connectionStartHandle: s.connectionStartHandle,
  connectOnClick: s.connectOnClick,
});

const Handle = forwardRef<HTMLDivElement, HandleComponentProps>(
  (
    {
      type = 'source',
      position = Position.Top,
      isValidConnection = alwaysValid,
      isConnectable = true,
      id,
      onConnect,
      children,
      className,
      onMouseDown,
      cardinality,
      dataType,
      tensorShape = [],
      ...rest
    },
    ref
  ) => {
    const store = useStoreApi();
    const nodeId = useContext(NodeIdContext) as string;
    const { connectionStartHandle, connectOnClick } = useStore(selector, shallow);

    const index = cardinality || Math.round(Math.random() * 1000);
    const handleId = id || `${nodeId}-${type}-${index}`;
    const isTarget = type === 'target';

    const onConnectExtended = (params: Connection) => {
      const { defaultEdgeOptions, onConnect: onConnectAction, hasDefaultEdges } = store.getState();

      const edgeParams = {
        ...defaultEdgeOptions,
        ...params,
      };
      if (hasDefaultEdges) {
        const { edges } = store.getState();
        store.setState({ edges: addEdge(edgeParams, edges) });
      }

      onConnectAction?.(edgeParams);
      onConnect?.(edgeParams);
    };

    const onMouseDownHandler = (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.button === 0) {
        handleMouseDown({
          event,
          handleId,
          nodeId,
          onConnect: onConnectExtended,
          isTarget,
          getState: store.getState,
          setState: store.setState,
          isValidConnection,
        });
      }
      onMouseDown?.(event);
    };

    const onClick = (event: React.MouseEvent) => {
      const { onClickConnectStart, onClickConnectStop, onClickConnectEnd, connectionMode } = store.getState();
      if (!connectionStartHandle) {
        onClickConnectStart?.(event, { nodeId, handleId, handleType: type });
        store.setState({ connectionStartHandle: { nodeId, type, handleId } });
        return;
      }

      const doc = getHostForElement(event.target as HTMLElement);
      const { connection, isValid } = checkElementBelowIsValid(
        event as unknown as MouseEvent,
        connectionMode,
        connectionStartHandle.type === 'target',
        connectionStartHandle.nodeId,
        connectionStartHandle.handleId || null,
        isValidConnection,
        doc
      );

      onClickConnectStop?.(event as unknown as MouseEvent);

      if (isValid) {
        onConnectExtended(connection);
      }

      onClickConnectEnd?.(event as unknown as MouseEvent);

      store.setState({ connectionStartHandle: null });
    };

    return (
      <div
        data-handleid={handleId}
        data-nodeid={nodeId}
        data-data-type={dataType}
        data-tensor-shape={tensorShape}
        data-handlepos={position}
        className={cc([
          'react-flow__handle',
          `react-flow__handle-${position}`,
          'nodrag',
          className,
          {
            source: !isTarget,
            target: isTarget,
            connectable: isConnectable,
            connecting:
              connectionStartHandle?.nodeId === nodeId &&
              connectionStartHandle?.handleId === handleId &&
              connectionStartHandle?.type === type,
          },
        ])}
        onMouseDown={onMouseDownHandler}
        onClick={connectOnClick ? onClick : undefined}
        ref={ref}
        {...rest}
      >
        {children}
      </div>
    );
  }
);

Handle.displayName = 'Handle';

export default memo(Handle);
