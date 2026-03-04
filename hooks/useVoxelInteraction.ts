import { useState, useCallback } from 'react';
import * as THREE from 'three';
import { ThreeEvent } from '@react-three/fiber';
import { useStore } from '@/store';
import { useShallow } from 'zustand/react/shallow';
import { posKey, VoxelData, Position } from '@/lib/voxel/types';
import { GRID_SIZE, MAX_Y_LEVELS } from '@/constants/grid';

function inBounds(x: number, y: number, z: number) {
  return x >= 0 && x < GRID_SIZE && y >= 0 && y < MAX_Y_LEVELS && z >= 0 && z < GRID_SIZE;
}

export function useVoxelInteraction() {
  const { tool, color, material, voxels, activeLayerId } = useStore(
    useShallow((s) => ({
      tool: s.tool,
      color: s.color,
      material: s.material,
      voxels: s.voxels,
      activeLayerId: s.activeLayerId,
    }))
  );
  const placeVoxel = useStore((s) => s.placeVoxel);
  const removeVoxel = useStore((s) => s.removeVoxel);
  const pushOps = useStore((s) => s.pushOps);

  const [ghostPos, setGhostPos] = useState<Position | null>(null);

  const handlePointerMove = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      const pt = e.point;
      const x = Math.round(pt.x);
      const z = Math.round(pt.z);
      const y = 0;
      if (inBounds(x, y, z)) setGhostPos({ x, y, z });
      else setGhostPos(null);
    },
    []
  );

  const handleGroundClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      if (tool !== 'place') return;
      const pt = e.point;
      const x = Math.round(pt.x);
      const z = Math.round(pt.z);
      const y = 0;
      if (!inBounds(x, y, z)) return;
      const voxelData: VoxelData = { color, material };
      placeVoxel(activeLayerId, x, y, z, voxelData);
      pushOps([{ type: 'place', layerId: activeLayerId, key: posKey(x, y, z), voxel: voxelData }]);
    },
    [tool, color, material, activeLayerId, placeVoxel, pushOps]
  );

  // voxelLayerId: the layer the clicked voxel belongs to
  const handleVoxelClick = useCallback(
    (e: ThreeEvent<MouseEvent>, ref: React.RefObject<THREE.Mesh>, voxelLayerId: string) => {
      if (!e.faceIndex || !ref.current) return;
      e.stopPropagation();
      const { x, y, z } = ref.current.position;
      console.log(ref);
      if (tool === 'place') {
        const dir = [
          [x + 1, y, z],
          [x - 1, y, z],
          [x, y + 1, z],
          [x, y - 1, z],
          [x, y, z + 1],
          [x, y, z - 1],
        ];
        const face = Math.floor(e.faceIndex / 2);
        const [nx, ny, nz] = dir[face];
        if (!inBounds(nx, ny, nz)) return;
        const voxelData: VoxelData = { color, material };
        placeVoxel(activeLayerId, nx, ny, nz, voxelData);
        pushOps([{ type: 'place', layerId: activeLayerId, key: posKey(nx, ny, nz), voxel: voxelData }]);
      }

      if (tool === 'remove') {
        const key = posKey(x, y, z);
        const previous = voxels.get(voxelLayerId)?.get(key);
        if (!previous) return;
        removeVoxel(voxelLayerId, x, y, z);
        pushOps([{ type: 'remove', layerId: voxelLayerId, key, previous }]);
      }

      if (tool === 'paint') {
        const key = posKey(x, y, z);
        const voxelData: VoxelData = { color, material };
        placeVoxel(voxelLayerId, x, y, z, voxelData);
        pushOps([{ type: 'place', layerId: voxelLayerId, key, voxel: voxelData }]);
      }
    },
    [tool, color, material, activeLayerId, voxels, placeVoxel, removeVoxel, pushOps]
  );

  const handlePointerLeave = useCallback(() => {
    setGhostPos(null);
  }, []);

  return {
    ghostPos,
    handlePointerMove,
    handleGroundClick,
    handleVoxelClick,
    handlePointerLeave,
  };
}
