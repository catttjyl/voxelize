export type Position = { x: number; y: number; z: number };

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
}

export enum Material {
  Wood = 'wood',
  Concrete = 'concrete',
  Glass = 'glass',
  Steel = 'steel',
  Granite = 'granite',
  Marble = 'marble',
  Brick = 'brick',
  Tile = 'tile',
}

export interface VoxelData {
  color: string;
  material: Material;
}

/** Inner map: "x,y,z" → VoxelData */
export type VoxelMap = Map<string, VoxelData>;

/** Outer map: layerId → VoxelMap */
export type LayeredVoxelMap = Map<string, VoxelMap>;

export function posKey(x: number, y: number, z: number): string {
  return `${x},${y},${z}`;
}

export function parseKey(key: string): Position {
  const [x, y, z] = key.split(',').map(Number);
  return { x, y, z };
}

export type Operation =
  | { type: 'place'; layerId: string; key: string; voxel: VoxelData }
  | { type: 'remove'; layerId: string; key: string; previous: VoxelData };
