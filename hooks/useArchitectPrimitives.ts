import { posKey } from "../lib/voxel/types";
import { useStore } from '@/store';

export function useArchitectPrimitives() {
  const placeVoxel = useStore((s) => s.placeVoxel);
  const pushOps = useStore((s) => s.pushOps);

  function fillBox(activeLayerId: string, x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, color: string): void {
    for (let x = x0; x <= x1; x++)
      for (let y = y0; y <= y1; y++)
        for (let z = z0; z <= z1; z++) {
          placeVoxel(activeLayerId, x, y, z, { color });
          pushOps([{ type: 'place', layerId: activeLayerId, key: posKey(x, y, z), voxel: { color } }]);
        }
  }

  function fillFloor(activeLayerId: string, x0: number, y0: number, z0: number, x1: number, z1: number, color: string): void {
    for (let x = x0; x <= x1; x++)
      for (let z = z0; z <= z1; z++) {
        placeVoxel(activeLayerId, x, y0, z, { color });
        pushOps([{ type: 'place', layerId: activeLayerId, key: posKey(x, y0, z), voxel: { color } }]);
      }
  }

  function fillWall(activeLayerId: string, x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, color: string): void {
    for (let x = x0; x <= x1; x++)
      for (let y = y0; y <= y1; y++)
        for (let z = z0; z <= z1; z++) {
          if (x === x0 || x === x1 || y === y0 || y === y1 || z === z0 || z === z1) {
            placeVoxel(activeLayerId, x, y, z, { color });
            pushOps([{ type: 'place', layerId: activeLayerId, key: posKey(x, y, z), voxel: { color } }]);
          }
        }
  }

  function addWindow(activeLayerId: string, wx: number, wy: number, wz: number, axis: 'x' | 'z', w: number, h: number, color: string): void {
    for (let i = 0; i < w; i++)
      for (let j = 0; j < h; j++) {
        const pos = axis === "x"
          ? { x: wx, y: wy + j, z: wz + i }
          : { x: wx + i, y: wy + j, z: wz };
        placeVoxel(activeLayerId, pos.x, pos.y, pos.z, { color });
        pushOps([{ type: 'place', layerId: activeLayerId, key: posKey(pos.x, pos.y, pos.z), voxel: { color } }]);
      }
  }

  function addDoor(activeLayerId: string, dx: number, dy: number, dz: number, axis: 'x' | 'z', w: number, h: number, color: string): void {
    for (let i = 0; i < w; i++)
      for (let j = 0; j < h; j++) {
        const pos = axis === "x"
          ? { x: dx, y: dy + j, z: dz + i }
          : { x: dx + i, y: dy + j, z: dz };
        placeVoxel(activeLayerId, pos.x, pos.y, pos.z, { color });
        pushOps([{ type: 'place', layerId: activeLayerId, key: posKey(pos.x, pos.y, pos.z), voxel: { color } }]);
      }
  }

  function addColumn(activeLayerId: string, x: number, y0: number, z: number, yc: number, color: string): void {
    for (let i = y0; i < yc; i++) {
      placeVoxel(activeLayerId, x, i, z, { color });
      pushOps([{ type: 'place', layerId: activeLayerId, key: posKey(x, i, z), voxel: { color } }]);
    }
  }

  function gableRoof(activeLayerId: string, x0: number, z0: number, x1: number, z1: number, baseY: number, color: string): void {
    const midZ = Math.floor((z0 + z1) / 2);
    const depth = midZ - z0;
    for (let layer = 0; layer <= depth; layer++) {
      for (let x = x0 - 1; x <= x1 + 1; x++) {
        placeVoxel(activeLayerId, x, baseY + layer, z0 + layer, { color });
        pushOps([{ type: 'place', layerId: activeLayerId, key: posKey(x, baseY + layer, z0 + layer), voxel: { color } }]);
        placeVoxel(activeLayerId, x, baseY + layer, z1 - layer, { color });
        pushOps([{ type: 'place', layerId: activeLayerId, key: posKey(x, baseY + layer, z1 - layer), voxel: { color } }]);
      }
      if (z0 + layer === z1 - layer)
        for (let x = x0 - 1; x <= x1 + 1; x++) {
          placeVoxel(activeLayerId, x, baseY + layer, z0 + layer, { color });
          pushOps([{ type: 'place', layerId: activeLayerId, key: posKey(x, baseY + layer, z0 + layer), voxel: { color } }]);
        }
    }
  }

  function hipRoof(activeLayerId: string, x0: number, z0: number, x1: number, z1: number, baseY: number, color: string): void {
    let cx0 = x0 - 1, cz0 = z0 - 1, cx1 = x1 + 1, cz1 = z1 + 1;
    let layer = 0;
    while (cx0 <= cx1 && cz0 <= cz1) {
      for (let x = cx0; x <= cx1; x++) {
        placeVoxel(activeLayerId, x, baseY + layer, cz0, { color });
        pushOps([{ type: 'place', layerId: activeLayerId, key: posKey(x, baseY + layer, cz0), voxel: { color } }]);
        placeVoxel(activeLayerId, x, baseY + layer, cz1, { color });
        pushOps([{ type: 'place', layerId: activeLayerId, key: posKey(x, baseY + layer, cz1), voxel: { color } }]);
      }
      for (let z = cz0 + 1; z < cz1; z++) {
        placeVoxel(activeLayerId, cx0, baseY + layer, z, { color });
        pushOps([{ type: 'place', layerId: activeLayerId, key: posKey(cx0, baseY + layer, z), voxel: { color } }]);
        placeVoxel(activeLayerId, cx1, baseY + layer, z, { color });
        pushOps([{ type: 'place', layerId: activeLayerId, key: posKey(cx1, baseY + layer, z), voxel: { color } }]);
      }
      cx0++; cz0++; cx1--; cz1--;
      layer++;
    }
  }

  function flatRoof(activeLayerId: string, x0: number, z0: number, x1: number, z1: number, y: number, color: string): void {
    for (let x = x0 - 1; x <= x1 + 1; x++)
      for (let z = z0 - 1; z <= z1 + 1; z++) {
        placeVoxel(activeLayerId, x, y, z, { color });
        pushOps([{ type: 'place', layerId: activeLayerId, key: posKey(x, y, z), voxel: { color } }]);
      }
  }

  return { fillBox, fillFloor, fillWall, addWindow, addDoor, addColumn, gableRoof, hipRoof, flatRoof };
}
