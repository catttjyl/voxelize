import { StateCreator } from 'zustand';
import { VoxelData, LayeredVoxelMap, posKey } from '@/lib/voxel/types';

// Must match the default layer IDs in toolSlice
const DEFAULT_LAYER_IDS = ['layer-0', 'layer-1', 'layer-2'];

export interface VoxelSlice {
  voxels: LayeredVoxelMap;
  placeVoxel: (layerId: string, x: number, y: number, z: number, data: VoxelData) => void;
  removeVoxel: (layerId: string, x: number, y: number, z: number) => void;
  setVoxels: (voxels: LayeredVoxelMap) => void;
  clearAll: () => void;
}

export const createVoxelSlice: StateCreator<VoxelSlice> = (set) => ({
  voxels: new Map(DEFAULT_LAYER_IDS.map((id) => [id, new Map()])),

  placeVoxel: (layerId, x, y, z, data) =>
    set((s) => {
      const next = new Map(s.voxels);
      const layerMap = new Map(next.get(layerId) ?? new Map());
      layerMap.set(posKey(x, y, z), data);
      next.set(layerId, layerMap);
      return { voxels: next };
    }),

  removeVoxel: (layerId, x, y, z) =>
    set((s) => {
      const next = new Map(s.voxels);
      const layerMap = new Map(next.get(layerId) ?? new Map());
      layerMap.delete(posKey(x, y, z));
      next.set(layerId, layerMap);
      return { voxels: next };
    }),

  setVoxels: (voxels) => set({ voxels }),

  clearAll: () =>
    set((s) => ({
      voxels: new Map([...s.voxels.keys()].map((id) => [id, new Map()])),
    })),
});
