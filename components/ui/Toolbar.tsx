'use client';

import { ReactNode } from 'react';
import { useStore } from '@/store';
import { ToolMode } from '@/store/toolSlice';
import placeIcon from '@/assets/actions/place.png';
import removeIcon from '@/assets/actions/eraser.png';
import paintIcon from '@/assets/actions/paint.png';

const TOOLS: { mode: ToolMode; label: string; key: string; icon: ReactNode }[] = [
  { mode: 'place', label: 'Place', key: 'B', icon: <img src={placeIcon.src} alt="Place" className="w-6 h-6 brightness-0 invert" /> },
  { mode: 'remove', label: 'Remove', key: 'E', icon: <img src={removeIcon.src} alt="Remove" className="w-6 h-6 brightness-0 invert" /> },
  { mode: 'paint', label: 'Paint', key: 'P', icon: <img src={paintIcon.src} alt="Paint" className="w-6 h-6 brightness-0 invert" /> },
];

export default function Toolbar() {
  const tool = useStore((s) => s.tool);
  const setTool = useStore((s) => s.setTool);
  const undo = useStore((s) => s.undo);
  const redo = useStore((s) => s.redo);
  const clearAll = useStore((s) => s.clearAll);

  return (
    <div className="flex flex-col gap-2 p-2 bg-gray-900/90 border border-gray-700 rounded-xl backdrop-blur-sm">
      {TOOLS.map(({ mode, label, key, icon }) => (
        <button
          key={mode}
          onClick={() => setTool(mode)}
          title={`${label} (${key})`}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-lg text-xs font-medium transition-all
            ${tool === mode
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
        >
          <span className="text-lg leading-none">{icon}</span>
          <span className="mt-0.5">{key}</span>
        </button>
      ))}

      <div className="h-px bg-gray-700 my-1" />

      <button
        onClick={undo}
        title="Undo (Cmd+Z)"
        className="flex flex-col items-center justify-center w-12 h-12 rounded-lg text-xs bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white transition-all"
      >
        <span className="text-lg leading-none">↩</span>
        <span className="mt-0.5">Undo</span>
      </button>
      <button
        onClick={redo}
        title="Redo (Cmd+Shift+Z)"
        className="flex flex-col items-center justify-center w-12 h-12 rounded-lg text-xs bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white transition-all"
      >
        <span className="text-lg leading-none">↪</span>
        <span className="mt-0.5">Redo</span>
      </button>

      <div className="h-px bg-gray-700 my-1" />

      <button
        onClick={() => { if (confirm('Clear all voxels?')) clearAll(); }}
        title="Clear all"
        className="flex flex-col items-center justify-center w-12 h-12 rounded-lg text-xs bg-gray-800 text-red-400 hover:bg-red-900/40 hover:text-red-300 transition-all"
      >
        <span className="text-lg leading-none">✕</span>
        <span className="mt-0.5">Clear</span>
      </button>
    </div>
  );
}
