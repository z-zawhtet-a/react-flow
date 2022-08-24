import { MouseEvent as ReactMouseEvent, ComponentType, MemoExoticComponent } from 'react';
import { Selection as D3Selection, ZoomBehavior } from 'd3';

import { XYPosition, Rect, Transform, CoordinateExtent } from './utils';
import { NodeChange, EdgeChange } from './changes';
import {
  Node,
  NodeInternals,
  NodeDimensionUpdate,
  NodeProps,
  WrapNodeProps,
  NodeDragItem,
  NodeDragHandler,
  SelectionDragHandler,
} from './nodes';
import { Edge, EdgeProps, WrapEdgeProps } from './edges';
import { HandleData, HandleType, StartHandle } from './handles';
import { DefaultEdgeOptions } from '.';
import { ReactFlowInstance } from './instance';

export type NodeTypes = { [key: string]: ComponentType<NodeProps> };
export type NodeTypesWrapped = { [key: string]: MemoExoticComponent<ComponentType<WrapNodeProps>> };
export type EdgeTypes = { [key: string]: ComponentType<EdgeProps> };
export type EdgeTypesWrapped = { [key: string]: MemoExoticComponent<ComponentType<WrapEdgeProps>> };

export type FitView = (fitViewOptions?: FitViewOptions) => void;

export type Project = (position: XYPosition) => XYPosition;

export type OnNodesChange = (nodes: NodeChange[]) => void;
export type OnEdgesChange = (nodes: EdgeChange[]) => void;

export type OnNodesDelete = (nodes: Node[]) => void;
export type OnEdgesDelete = (edges: Edge[]) => void;

export type OnMove = (event: MouseEvent | TouchEvent, viewport: Viewport) => void;
export type OnMoveStart = OnMove;
export type OnMoveEnd = OnMove;

export type ZoomInOut = (options?: ViewportHelperFunctionOptions) => void;
export type ZoomTo = (zoomLevel: number, options?: ViewportHelperFunctionOptions) => void;
export type GetZoom = () => number;
export type GetViewport = () => Viewport;
export type SetViewport = (viewport: Viewport, options?: ViewportHelperFunctionOptions) => void;
export type SetCenter = (x: number, y: number, options?: SetCenterOptions) => void;
export type FitBounds = (bounds: Rect, options?: FitBoundsOptions) => void;

export type OnInit<NodeData = any, EdgeData = any> = (reactFlowInstance: ReactFlowInstance<NodeData, EdgeData>) => void;

export interface Connection {
  source: string | null;
  target: string | null;
  sourceHandle: string | null;
  targetHandle: string | null;
}

export enum ConnectionMode {
  Strict = 'strict',
  Loose = 'loose',
}

export type OnConnect = (connection: Connection) => void;

export type FitViewOptions = {
  padding?: number;
  includeHiddenNodes?: boolean;
  minZoom?: number;
  maxZoom?: number;
  duration?: number;
};

export type OnConnectStartParams = {
  nodeId: string | null;
  handleId: string | null;
  handleType: HandleType | null;
};

export type OnConnectStart = (event: ReactMouseEvent, params: OnConnectStartParams) => void;

export type OnConnectStop = (event: MouseEvent) => void;

export type OnConnectEnd = (event: MouseEvent) => void;

export enum BackgroundVariant {
  Lines = 'lines',
  Dots = 'dots',
}

export type Viewport = {
  x: number;
  y: number;
  zoom: number;
};

export type KeyCode = string | Array<string>;

export type SnapGrid = [number, number];

export enum PanOnScrollMode {
  Free = 'free',
  Vertical = 'vertical',
  Horizontal = 'horizontal',
}

export type ViewportHelperFunctionOptions = {
  duration?: number;
};

export type SetCenterOptions = ViewportHelperFunctionOptions & {
  zoom?: number;
};

export type FitBoundsOptions = ViewportHelperFunctionOptions & {
  padding?: number;
};

export type UnselectNodesAndEdgesParams = {
  nodes?: Node[];
  edges?: Edge[];
};

export interface ViewportHelperFunctions {
  zoomIn: ZoomInOut;
  zoomOut: ZoomInOut;
  zoomTo: ZoomTo;
  getZoom: GetZoom;
  setViewport: SetViewport;
  getViewport: GetViewport;
  fitView: FitView;
  setCenter: SetCenter;
  fitBounds: FitBounds;
  project: Project;
  viewportInitialized: boolean;
}

export type ReactFlowStore = {
  width: number;
  height: number;
  transform: Transform;
  nodeInternals: NodeInternals;
  edges: Edge[];
  sourceHandles: HandleData[];
  targetHandles: HandleData[];
  onNodesChange: OnNodesChange | null;
  onEdgesChange: OnEdgesChange | null;
  hasDefaultNodes: boolean;
  hasDefaultEdges: boolean;
  domNode: HTMLElement | null;

  d3Zoom: ZoomBehavior<Element, unknown> | null;
  d3Selection: D3Selection<Element, unknown, null, undefined> | null;
  d3ZoomHandler: ((this: Element, event: any, d: unknown) => void) | undefined;
  minZoom: number;
  maxZoom: number;
  translateExtent: CoordinateExtent;
  nodeExtent: CoordinateExtent;

  nodesSelectionActive: boolean;
  userSelectionActive: boolean;

  connectionNodeId: string | null;
  connectionHandleId: string | null;
  connectionHandleType: HandleType | null;
  connectionPosition: XYPosition;
  connectionMode: ConnectionMode;

  snapToGrid: boolean;
  snapGrid: SnapGrid;

  nodesDraggable: boolean;
  nodesConnectable: boolean;
  elementsSelectable: boolean;

  multiSelectionActive: boolean;

  reactFlowVersion: string;

  connectionStartHandle: StartHandle | null;

  onNodeDragStart?: NodeDragHandler;
  onNodeDrag?: NodeDragHandler;
  onNodeDragStop?: NodeDragHandler;

  onSelectionDragStart?: SelectionDragHandler;
  onSelectionDrag?: SelectionDragHandler;
  onSelectionDragStop?: SelectionDragHandler;

  onConnect?: OnConnect;
  onConnectStart?: OnConnectStart;
  onConnectStop?: OnConnectStop;
  onConnectEnd?: OnConnectEnd;

  onClickConnectStart?: OnConnectStart;
  onClickConnectStop?: OnConnectStop;
  onClickConnectEnd?: OnConnectEnd;

  connectOnClick: boolean;
  defaultEdgeOptions?: DefaultEdgeOptions;

  fitViewOnInit: boolean;
  fitViewOnInitDone: boolean;
  fitViewOnInitOptions: FitViewOptions | undefined;

  onNodesDelete?: OnNodesDelete;
  onEdgesDelete?: OnEdgesDelete;
};

export type ReactFlowActions = {
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  setSourceHandles: (handles: HandleData[]) => void;
  setTargetHandles: (handles: HandleData[]) => void;
  setDefaultNodesAndEdges: (nodes?: Node[], edges?: Edge[]) => void;
  updateNodeDimensions: (updates: NodeDimensionUpdate[]) => void;
  updateNodePositions: (nodeDragItems: NodeDragItem[], positionChanged: boolean, dragging: boolean) => void;
  resetSelectedElements: () => void;
  unselectNodesAndEdges: (params?: UnselectNodesAndEdgesParams) => void;
  addSelectedNodes: (nodeIds: string[]) => void;
  addSelectedEdges: (edgeIds: string[]) => void;
  setMinZoom: (minZoom: number) => void;
  setMaxZoom: (maxZoom: number) => void;
  setTranslateExtent: (translateExtent: CoordinateExtent) => void;
  setNodeExtent: (nodeExtent: CoordinateExtent) => void;
  reset: () => void;
};

export type ReactFlowState = ReactFlowStore & ReactFlowActions;

export type UpdateNodeInternals = (nodeId: string) => void;

export type OnSelectionChangeParams = {
  nodes: Node[];
  edges: Edge[];
};

export type OnSelectionChangeFunc = (params: OnSelectionChangeParams) => void;

export type AttributionPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export type ProOptions = {
  account: string;
  hideAttribution: boolean;
};
