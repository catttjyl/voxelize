'use client';

import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { useStore } from '@/store';
import { DEFAULT_PALETTE } from '@/constants/colors';
import { MATERIAL_COLORS, MATERIAL_LABELS } from '@/constants/materials';
import { Material } from '@/lib/voxel/types';

export default function ColorPicker() {
  const color = useStore((s) => s.color);
  const material = useStore((s) => s.material);
  const setColor = useStore((s) => s.setColor);
  const setMaterial = useStore((s) => s.setMaterial);
  const [showBoard, setShowBoard] = useState(false);

  const handleMaterialClick = (mat: Material) => {
    console.log('handleMaterialClick', mat);
    setMaterial(mat);
    setColor(MATERIAL_COLORS[mat]);
  };

  return (
    <div className="p-3 bg-gray-900/90 border border-gray-700 rounded-xl backdrop-blur-sm w-full">
      <p className="text-xs font-semibold text-gray-400 mb-2 uppercase">Material</p>
      <div className="grid grid-cols-3 gap-2 p-5">
        {Object.values(Material).map((mat) => (
          <button
            key={mat}
            onClick={() => handleMaterialClick(mat)}
            title={MATERIAL_LABELS[mat]}
            className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg text-xs transition-all
              ${material === mat
                ? 'ring-2 ring-white bg-gray-700'
                : 'bg-gray-800 hover:bg-gray-700'
              }`}
          >
            <span
              className="w-5 h-5 rounded-sm border border-gray-600"
              style={{ background: MATERIAL_COLORS[mat] }}
            />
            <span className="text-gray-300 text-[10px] leading-none">{MATERIAL_LABELS[mat]}</span>
          </button>
        ))}
      </div>

      <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Color</p>
      <div className="grid grid-cols-6 gap-1 mb-2">
        {DEFAULT_PALETTE.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            title={c}
            className={`w-7 h-7 rounded-md border-2 transition-all
              ${color === c ? 'border-white scale-110' : 'border-transparent hover:border-gray-400'}`}
            style={{ background: c }}
          />
        ))}
      </div>

      <button
        onClick={() => setShowBoard((v) => !v)}
        className="flex items-center gap-2 mt-2 w-full hover:bg-gray-800 rounded-md px-1 py-0.5 transition-colors"
      >
        <span
          className="w-5 h-5 rounded border border-gray-500 flex-shrink-0"
          style={{ background: color }}
        />
        <span className="text-xs text-gray-400">Custom</span>
        <span className="text-xs text-gray-500 font-mono ml-auto">{color}</span>
      </button>

      {showBoard && (
        <div className="mt-2">
          <HexColorPicker color={color} onChange={setColor} style={{ width: '100%' }} />
        </div>
      )}
    </div>
  );
}
