import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { createVoxelSlice, VoxelSlice } from './voxelSlice';
import { createToolSlice, ToolSlice } from './toolSlice';
import { createHistorySlice, HistorySlice } from './historySlice';

export type StoreState = VoxelSlice & ToolSlice & HistorySlice;

export const useStore = create<StoreState>()(
  subscribeWithSelector(
    devtools(
      (...a) => ({
        ...createVoxelSlice(...a),
        ...createToolSlice(...a),
        ...createHistorySlice(...a),
      }),
      { name: 'VoxelStore' }
    )
  )
);
