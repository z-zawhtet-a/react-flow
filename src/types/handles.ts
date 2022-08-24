import { XYPosition, Position, Dimensions } from './utils';
import { OnConnect, Connection } from './general';

export type HandleType = 'source' | 'target';

export type DataType = 'unknown' | 'scalar' | 'vector' | 'string' | 'Tensor1D' | 'Tensor2D' | 'Tensor3D' | 'Tensor4D';

export interface HandleElement extends XYPosition, Dimensions {
  id?: string | null;
  position: Position;
  dataType?: DataType;
  tensorShape?: number[];
}

export interface HandleData {
  id: string;
  type: HandleType;
  parentId: string;
  parentType: string;
  position?: Position;
  dataType: DataType;
  tensorShape?: number[];
}

export interface StartHandle {
  nodeId: string;
  type: HandleType;
  handleId?: string | null;
}

export interface HandleProps {
  type: HandleType;
  position: Position;
  isConnectable?: boolean;
  onConnect?: OnConnect;
  isValidConnection?: (connection: Connection) => boolean;
  id?: string;
  dataType?: DataType;
  tensorShape?: number[];
}

