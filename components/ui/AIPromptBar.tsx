'use client';

import { useState, useRef } from 'react';
import { useStore } from '@/store';
import { GeneratedVoxel } from '@/lib/voxel/types';
import { MATERIAL_COLORS_GENERATED } from '@/constants/materials';
import { useArchitectPrimitives } from '@/hooks/useArchitectPrimitives';

export default function AIPromptBar() {
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const { fillBox, fillFloor, fillWall, addWindow, addDoor, addColumn, gableRoof, hipRoof, flatRoof } = useArchitectPrimitives();
  const clearAll = useStore((s) => s.clearAll);

  async function handleGenerate() {
    const trimmed = prompt.trim();
    if (!trimmed || status === 'loading') return;

    setStatus('loading');
    setErrorMsg('');

    try {
      const controller = new AbortController();
      abortRef.current = controller;

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: trimmed }),
        signal: controller.signal,
      });
      abortRef.current = null;

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? 'Generation failed');
        setStatus('error');
        return;
      }

      const generated: GeneratedVoxel[] = data.voxels;
      if (!generated.length) {
        setErrorMsg('No voxels generated');
        setStatus('error');
        return;
      }
      
      // clear current voxels and put new voxels
      clearAll();
      // const voxelMap = new Map();
      const activeLayerId = 'layer-0';

      // Apply all voxels
      for (const each of generated) {
        const { x, y, z } = each;
        switch (each.type) {
          case "box": {
            const width = each.width ?? 1;
            const length = each.length ?? 1;
            const height = each.height ?? 1;
            const color = MATERIAL_COLORS_GENERATED[each.material as keyof typeof MATERIAL_COLORS_GENERATED] ?? MATERIAL_COLORS_GENERATED.concrete;
            fillBox(activeLayerId, x, y, z, x + width, y + height, z + length, color);
            break;
          }
          case "floor": {
            const width = each.width ?? 1;
            const length = each.length ?? 1;
            const color = MATERIAL_COLORS_GENERATED[each.material as keyof typeof MATERIAL_COLORS_GENERATED] ?? MATERIAL_COLORS_GENERATED.foundation;
            fillFloor(activeLayerId, x, y, z, x + width, z + length, color);
            break;
          }
          case "walls": {
            const width = each.width ?? 1;
            const length = each.length ?? 1;
            const height = each.height ?? 1;
            const color = MATERIAL_COLORS_GENERATED[each.material as keyof typeof MATERIAL_COLORS_GENERATED] ?? MATERIAL_COLORS_GENERATED.clapboard;
            fillWall(activeLayerId, x, y, z, x + width, y + height, z + length, color);
            break;
          }
          case "window": {
            const width = each.width ?? 1;
            const height = each.height ?? 1;
            const axis = each.face === "front" || each.face === "back" ? "x" : "z";
            addWindow(activeLayerId, x, y, z, axis, width, height, MATERIAL_COLORS_GENERATED.glass);
            break;
          }
          case "door": {
            const width = each.width ?? 1;
            const height = each.height ?? 1;
            const axis = each.face === "front" || each.face === "back" ? "x" : "z";
            const color = MATERIAL_COLORS_GENERATED[each.material as keyof typeof MATERIAL_COLORS_GENERATED] ?? MATERIAL_COLORS_GENERATED.door_wood;
            addDoor(activeLayerId, x, y, z, axis, width, height, color);
            break;
          }
          case "column": {
            const height = each.height ?? 1;
            const color = MATERIAL_COLORS_GENERATED[each.material as keyof typeof MATERIAL_COLORS_GENERATED] ?? MATERIAL_COLORS_GENERATED.column;
            addColumn(activeLayerId, x, y, z, y + height, color);
            break;
          }
          case "gableRoof": {
            const width = each.width ?? 1;
            const length = each.length ?? 1;
            const color = MATERIAL_COLORS_GENERATED[each.material as keyof typeof MATERIAL_COLORS_GENERATED] ?? MATERIAL_COLORS_GENERATED.roof_shingle;
            gableRoof(activeLayerId, x, z, x + width, z + length, y, color);
            break;
          }
          case "hipRoof": {
            const width = each.width ?? 1;
            const length = each.length ?? 1;
            const color = MATERIAL_COLORS_GENERATED[each.material as keyof typeof MATERIAL_COLORS_GENERATED] ?? MATERIAL_COLORS_GENERATED.roof_shingle;
            hipRoof(activeLayerId, x, z, x + width, z + length, y, color);
            break;
          }
          case "flatRoof": {
            const width = each.width ?? 1;
            const length = each.length ?? 1;
            const color = MATERIAL_COLORS_GENERATED[each.material as keyof typeof MATERIAL_COLORS_GENERATED] ?? MATERIAL_COLORS_GENERATED.concrete;
            flatRoof(activeLayerId, x, y, z, x + width, z + length, color);  
            break;
          }
        }
      }
      // setVoxels(new Map([['layer-0', voxelMap]]));

      setPrompt('');
      setStatus('idle');
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setStatus('idle');
      } else {
        setErrorMsg('Network error');
        setStatus('error');
      }
    }
  }

  function handleCancel() {
    abortRef.current?.abort();
    abortRef.current = null;
    setStatus('idle');
    inputRef.current?.blur();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleGenerate();
    if (e.key === 'Escape') {
      handleCancel();
    }
  }

  return (
    <div className="flex flex-col gap-1.5 w-72 p-2 bg-gray-900/90 border border-gray-700 rounded-xl backdrop-blur-sm">
      <div className="flex items-center gap-1.5 px-1">
        <span className="text-purple-400 text-xs font-semibold tracking-wide">AI Generate</span>
        {status === 'loading' && (
          <span className="text-gray-500 text-xs animate-pulse">Generating…</span>
        )}
      </div>

      <div className="flex gap-1.5">
        <input
          ref={inputRef}
          type="text"
          value={prompt}
          onChange={(e) => { setPrompt(e.target.value); setStatus('idle'); }}
          onKeyDown={handleKeyDown}
          placeholder="e.g. 3-bedroom house footprint"
          disabled={status === 'loading'}
          className="flex-1 px-2.5 py-1.5 text-xs bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 disabled:opacity-50"
        />
        <button
          onClick={status === 'loading' ? handleCancel : handleGenerate}
          disabled={!prompt.trim()}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-purple-700 text-white hover:bg-purple-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {status === 'loading' ? 'Cancel' : 'Build'}
        </button>
      </div>

      {status === 'error' && (
        <p className="text-red-400 text-xs px-1">{errorMsg}</p>
      )}
    </div>
  );
}
