import { StateCreator } from 'zustand';
import { Layer, LayeredVoxelMap, Material } from '@/lib/voxel/types';
import { VoxelSlice } from './voxelSlice';

export type ToolMode = 'place' | 'remove' | 'paint';

const DEFAULT_LAYERS: Layer[] = [
  { id: 'layer-0', name: 'Layer 1', visible: true },
  { id: 'layer-1', name: 'Layer 2', visible: true },
  { id: 'layer-2', name: 'Layer 3', visible: true },
];

export interface ToolSlice {
  tool: ToolMode;
  color: string;
  material: Material;
  layers: Layer[];
  activeLayerId: string;
  setTool: (t: ToolMode) => void;
  setColor: (c: string) => void;
  setMaterial: (m: Material) => void;
  setActiveLayer: (id: string) => void;
  addLayer: () => void;
  removeLayer: (id: string) => void;
  renameLayer: (id: string, name: string) => void;
  toggleLayerVisibility: (id: string) => void;
  showAllLayers: () => void;
}

type Store = ToolSlice & Pick<VoxelSlice, 'voxels'>;

export const createToolSlice: StateCreator<Store, [], [], ToolSlice> = (set) => ({
  tool: 'place',
  color: '#c8a46e',
  material: Material.Wood,
  layers: DEFAULT_LAYERS,
  activeLayerId: DEFAULT_LAYERS[0].id,

  setTool: (tool) => set({ tool }),
  setColor: (color) => set({ color }),
  setMaterial: (material) => set({ material }),
  setActiveLayer: (activeLayerId) => set({ activeLayerId }),

  addLayer: () =>
    set((s) => {
      const id = `layer-${Date.now()}`;
      const name = `Layer ${s.layers.length + 1}`;
      const newVoxels: LayeredVoxelMap = new Map(s.voxels);
      newVoxels.set(id, new Map());
      return {
        layers: [...s.layers, { id, name, visible: true }],
        voxels: newVoxels,
      };
    }),

  removeLayer: (id) =>
    set((s) => {
      if (s.layers.length <= 1) return s;
      const next = s.layers.filter((l) => l.id !== id);
      const activeLayerId = s.activeLayerId === id ? next[0].id : s.activeLayerId;
      const newVoxels: LayeredVoxelMap = new Map(s.voxels);
      newVoxels.delete(id);
      return { layers: next, activeLayerId, voxels: newVoxels };
    }),

  renameLayer: (id, name) =>
    set((s) => ({
      layers: s.layers.map((l) => (l.id === id ? { ...l, name } : l)),
    })),

  toggleLayerVisibility: (id) =>
    set((s) => ({
      layers: s.layers.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l)),
    })),

  showAllLayers: () =>
    set((s) => ({ layers: s.layers.map((l) => ({ ...l, visible: true })) })),
});
