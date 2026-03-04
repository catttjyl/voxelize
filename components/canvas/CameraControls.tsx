'use client';

import { OrbitControls } from '@react-three/drei';

export default function CameraControls() {
  return (
    <OrbitControls
      mouseButtons={{
        LEFT: 0,         // ROTATE
        MIDDLE: 1,     // DOLLY
        RIGHT: 2,      // PAN
      }}
      minDistance={2}
      maxDistance={80}
    />
  );
}
