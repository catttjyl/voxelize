import { StateCreator } from 'zustand';
import { Operation } from '@/lib/voxel/types';
import { VoxelSlice } from './voxelSlice';

const MAX_HISTORY = 100;

export interface HistorySlice {
  undoStack: Operation[][];
  redoStack: Operation[][];
  pushOps: (ops: Operation[]) => void;
  undo: () => void;
  redo: () => void;
}

type Store = VoxelSlice & HistorySlice;

export const createHistorySlice: StateCreator<Store, [], [], HistorySlice> = (set, get) => ({
  undoStack: [],
  redoStack: [],

  pushOps: (ops) =>
    set((s) => {
      const undoStack = [...s.undoStack, ops].slice(-MAX_HISTORY);
      return { undoStack, redoStack: [] };
    }),

  undo: () => {
    const { undoStack, redoStack, voxels } = get();
    if (!undoStack.length) return;
    const ops = undoStack[undoStack.length - 1];
    const next = new Map(voxels);
    for (const op of [...ops].reverse()) {
      const layerMap = new Map(next.get(op.layerId) ?? new Map());
      if (op.type === 'place') {
        layerMap.delete(op.key);
      } else {
        layerMap.set(op.key, op.previous);
      }
      next.set(op.layerId, layerMap);
    }
    set({ voxels: next, undoStack: undoStack.slice(0, -1), redoStack: [...redoStack, ops] });
  },

  redo: () => {
    const { undoStack, redoStack, voxels } = get();
    if (!redoStack.length) return;
    const ops = redoStack[redoStack.length - 1];
    const next = new Map(voxels);
    for (const op of ops) {
      const layerMap = new Map(next.get(op.layerId) ?? new Map());
      if (op.type === 'place') {
        layerMap.set(op.key, op.voxel);
      } else {
        layerMap.delete(op.key);
      }
      next.set(op.layerId, layerMap);
    }
    set({ voxels: next, undoStack: [...undoStack, ops], redoStack: redoStack.slice(0, -1) });
  },
});
