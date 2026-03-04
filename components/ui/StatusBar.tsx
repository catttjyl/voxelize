'use client';

import { useStore } from '@/store';
import { ToolMode } from '@/store/toolSlice';

const TOOL_LABELS: Record<ToolMode, string> = {
  place: 'Place (B)',
  remove: 'Remove (E)',
  paint: 'Paint (P)',
};

export default function StatusBar() {
  const voxels = useStore((s) => s.voxels);
  const tool = useStore((s) => s.tool);
  const activeLayerId = useStore((s) => s.activeLayerId);
  const layers = useStore((s) => s.layers);
  const color = useStore((s) => s.color);

  const activeLayerName = layers.find((l) => l.id === activeLayerId)?.name ?? activeLayerId;
  const totalVoxels = [...voxels.values()].reduce((sum, m) => sum + m.size, 0);

  return (
    <div className="flex items-center gap-4 px-4 py-1.5 bg-gray-900/90 border border-gray-700 rounded-lg backdrop-blur-sm text-xs text-gray-400">
      <span>
        <span className="text-gray-500">Tool:</span>{' '}
        <span className="text-white">{TOOL_LABELS[tool]}</span>
      </span>
      <span>
        <span className="text-gray-500">Floor:</span>{' '}
        <span className="text-white">{activeLayerName}</span>
      </span>
      <span>
        <span className="text-gray-500">Voxels:</span>{' '}
        <span className="text-white">{totalVoxels}</span>
      </span>
      <span className="flex items-center gap-1">
        <span className="text-gray-500">Color:</span>
        <span
          className="inline-block w-3 h-3 rounded-sm border border-gray-600"
          style={{ background: color }}
        />
        <span className="text-white font-mono">{color}</span>
      </span>
    </div>
  );
}
