'use client';

import { useState } from 'react';
import { useStore } from '@/store';
import visibleIcon from '@/assets/actions/visibility.png';
import hiddenIcon from '@/assets/actions/invisible.png';

export default function LayerPanel() {
  const layers = useStore((s) => s.layers);
  const activeLayerId = useStore((s) => s.activeLayerId);
  const voxels = useStore((s) => s.voxels);
  const setActiveLayer = useStore((s) => s.setActiveLayer);
  const addLayer = useStore((s) => s.addLayer);
  const removeLayer = useStore((s) => s.removeLayer);
  const renameLayer = useStore((s) => s.renameLayer);
  const toggleLayerVisibility = useStore((s) => s.toggleLayerVisibility);
  const showAllLayers = useStore((s) => s.showAllLayers);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  function startRename(id: string, currentName: string) {
    setEditingId(id);
    setEditingName(currentName);
  }

  function commitRename() {
    if (editingId && editingName.trim()) {
      renameLayer(editingId, editingName.trim());
    }
    setEditingId(null);
  }

  return (
    <div className="p-3 bg-gray-900/90 border border-gray-700 rounded-xl backdrop-blur-sm w-full">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Layers</p>
        <button
          onClick={showAllLayers}
          className="text-[10px] text-blue-400 hover:text-blue-300 transition-colors"
        >
          Show all
        </button>
      </div>

      <div className="flex flex-col gap-1 max-h-64 overflow-y-auto pr-1">
        {layers.map((layer) => {
          const count = voxels.get(layer.id)?.size ?? 0;
          const isActive = activeLayerId === layer.id;

          return (
            <div
              key={layer.id}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-md cursor-pointer transition-all
                ${isActive ? 'bg-gray-100/20 text-white' : 'hover:bg-gray-800 text-gray-300'}`}
              onClick={() => setActiveLayer(layer.id)}
            >
              {/* Visibility toggle */}
              <button
                onClick={(e) => { e.stopPropagation(); toggleLayerVisibility(layer.id); }}
                className={`text-sm flex-shrink-0 transition-opacity ${layer.visible ? 'opacity-100' : 'opacity-30'}`}
                title={layer.visible ? 'Hide layer' : 'Show layer'}
              >
                <img src={layer.visible ? visibleIcon.src : hiddenIcon.src} alt="Visible" className="w-4 h-4 brightness-0 invert" />
              </button>

              {/* Name / rename input */}
              {editingId === layer.id ? (
                <input
                  autoFocus
                  className="text-xs flex-1 bg-gray-800 border border-blue-500 rounded px-1 outline-none text-white"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitRename();
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span
                  className="text-xs flex-1 truncate"
                  onDoubleClick={(e) => { e.stopPropagation(); startRename(layer.id, layer.name); }}
                  title="Double-click to rename"
                >
                  {layer.name}
                </span>
              )}

              {/* Voxel count */}
              {count > 0 && (
                <span className="text-[10px] text-gray-500 flex-shrink-0">{count}</span>
              )}

              {/* Delete button */}
              <button
                onClick={(e) => { e.stopPropagation(); removeLayer(layer.id); }}
                disabled={layers.length <= 1}
                className="text-[10px] text-white hover:text-red-400 disabled:opacity-20 disabled:cursor-not-allowed flex-shrink-0 transition-colors"
                title="Delete layer"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>

      {/* Add layer */}
      <button
        onClick={addLayer}
        className="mt-2 w-full text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 rounded-md py-1 transition-colors"
      >
        + Add layer
      </button>
    </div>
  );
}
