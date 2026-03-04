'use client';

import { Canvas } from '@react-three/fiber';
import { useCallback, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { ThreeEvent } from '@react-three/fiber';
import { useStore } from '@/store';
import { Material, parseKey } from '@/lib/voxel/types';
import { GRID_SIZE } from '@/constants/grid';
import { useVoxelInteraction } from '@/hooks/useVoxelInteraction';
import GhostVoxel from './GhostVoxel';
import Lighting from './Lighting';
import CameraControls from './CameraControls';
import { useTexture } from '@react-three/drei';

function Scene() {
  const color = useStore((s) => (s.color));
  const {
    ghostPos,
    handleVoxelClick,
    handlePointerMove,
    handleGroundClick,
    handlePointerLeave,
  } = useVoxelInteraction();

  return (
    <>
      <CameraControls />
      <Lighting />

      {/* Clickable ground plane */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[GRID_SIZE / 2 - 0.5, -0.5, GRID_SIZE / 2 - 0.5]}
        onClick={handleGroundClick}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        name="ground-plane"
      >
        <planeGeometry args={[GRID_SIZE, GRID_SIZE]} />
        <meshStandardMaterial color="#1a1a2e"/>
      </mesh>

      {/* Grid lines */}
      <gridHelper
        args={[GRID_SIZE, GRID_SIZE, '#3a3a4a', '#2a2a3a']}
        position={[GRID_SIZE / 2 - 0.5, -0.5, GRID_SIZE / 2 - 0.5]}
      />

      {/* Instanced voxels */}
      <InteractiveVoxelGrid handleVoxelClick={handleVoxelClick} />

      {/* Ghost/preview voxel */}
      <GhostVoxel position={ghostPos} color={color} />
    </>
  );
}

type VoxelClickHandler = (e: ThreeEvent<MouseEvent>, ref: React.RefObject<THREE.Mesh>, layerId: string) => void;

// Iterates the nested LayeredVoxelMap; only renders visible layers
function InteractiveVoxelGrid({ handleVoxelClick }: { handleVoxelClick: VoxelClickHandler }) {
  const voxels = useStore((s) => s.voxels);
  const layers = useStore((s) => s.layers);

  return (
    <group>
      {layers
        .filter((layer) => layer.visible)
        .flatMap((layer) => {
          const layerMap = voxels.get(layer.id) ?? new Map();
          return [...layerMap.entries()].map(([position, voxelData]) => {
            const { x, y, z } = parseKey(position);
            return (
              <VoxelMesh
                key={`${layer.id}-${position}`}
                color={voxelData.color}
                material={voxelData.material}
                position={{ x, y, z }}
                layerId={layer.id}
                handleVoxelClick={handleVoxelClick}
              />
            );
          });
        })}
    </group>
  );
}

function VoxelMesh({
  color,
  material,
  position,
  layerId,
  handleVoxelClick,
}: {
  color: string;
  material: Material;
  position: { x: number; y: number; z: number };
  layerId: string;
  handleVoxelClick: VoxelClickHandler;
}) {
  const ref = useRef<THREE.Mesh>(null);
  // const texture = useTexture('/textures/wood.png');
  const [hover, setHover] = useState<number | null>(null);
  const onMove = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHover(e.faceIndex != null ? Math.floor(e.faceIndex / 2) : null);
  }, []);
  const onOut = useCallback(() => setHover(null), []);
  return (
    <mesh
      receiveShadow
      castShadow
      position={[position.x, position.y, position.z]}
      onPointerMove={onMove}
      onPointerOut={onOut}
      onClick={(e) => handleVoxelClick(e, ref as React.RefObject<THREE.Mesh>, layerId)}
      ref={ref}
    >
      {[...Array(6)].map((_, index) => (
        <meshStandardMaterial
          attach={`material-${index}`}
          key={index}
          color={hover === index ? 'hotpink' : color}
          metalness={material === Material.Steel ? 1 : 0}
          transparent={material === Material.Glass}
          opacity={material === Material.Glass ? 0.5 : 1}
        />
      ))}
      <boxGeometry />
    </mesh>
  );
}

export default function VoxelScene() {
  return (
    <Canvas
      shadows
      camera={{ position: [16, 12, 28], fov: 50 }}
      gl={{ antialias: true }}
      style={{ background: '#0f0f1a' }}
    >
      <Scene />
    </Canvas>
  );
}
