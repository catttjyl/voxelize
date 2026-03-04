'use client';

import { useRef } from 'react';
import * as THREE from 'three';
import { Position } from '@/lib/voxel/types';

interface Props {
  position: Position | null;
  color: string;
}

export default function GhostVoxel({ position, color }: Props) {
  const meshRef = useRef<THREE.Mesh>(null);

  if (!position) return null;

  return (
    <mesh
      ref={meshRef}
      position={[position.x, position.y, position.z]}
      renderOrder={1}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.45}
        depthWrite={false}
      />
    </mesh>
  );
}
