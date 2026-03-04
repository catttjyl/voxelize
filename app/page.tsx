'use client';

import dynamic from 'next/dynamic';
import ShortcutBar from '@/components/ui/ShortcutBar';
import Toolbar from '@/components/ui/Toolbar';
import ColorPicker from '@/components/ui/ColorPicker';
import LayerPanel from '@/components/ui/LayerPanel';
import StatusBar from '@/components/ui/StatusBar';
import AIPromptBar from '@/components/ui/AIPromptBar';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

// R3F Canvas must never be SSR'd
const VoxelScene = dynamic(() => import('@/components/canvas/VoxelScene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-950 text-gray-500 text-sm">
      Loading 3D scene…
    </div>
  ),
});

export default function Home() {
  useKeyboardShortcuts();

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <>
      {/* 3D canvas */}
      <div className="absolute inset-0">
        <VoxelScene />
      </div>

      {/* UI Overlays */}
      {/* Left toolbar */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
        <Toolbar />
      </div>

      {/* Shortcut hints */}
      <div className="absolute left-3 top-3 z-10">
        <ShortcutBar />
      </div>

      {/* Right panels */}
      <div className="absolute right-3 top-3 z-10 flex flex-col gap-2 w-56">
        <ColorPicker />
        <LayerPanel />
      </div>

      {/* Top header */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
        <div className="px-4 py-1.5 bg-gray-900/90 border border-gray-700 rounded-lg backdrop-blur-sm">
          <span className="text-sm font-semibold text-white tracking-wide">A Voxel Editor</span>
          <span className="text-gray-500 text-xs ml-2">Housing Design Tool</span>
        </div>
      </div>

      {/* Bottom status bar */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10">
        <StatusBar />
      </div>
      </>
      <>
      {/* AI assistant */}
      <div className="absolute bottom-3 right-3 z-10">
        <AIPromptBar />
      </div>

      </>
    </div>
  );
}
