'use client';

import { useStore } from '@/store';

export default function ShortcutBar() {
    const tool = useStore((s) => s.tool);
    return (
        <div className="group flex flex-col bg-gray-900/90 border border-gray-700 rounded-lg backdrop-blur-sm text-xs text-gray-400 overflow-hidden">
            <span className="px-3 py-1.5 text-gray-500 font-medium">Shortcuts</span>
            <div className="max-h-0 group-hover:max-h-40 transition-all duration-500 overflow-hidden">
                <p className="px-3 pb-3 text-gray-600 leading-5">
                    Left-click: {tool} · Left-drag: rotate <br/>
                    Scroll: zoom · Right-drag: pan <br/>
                    B: Place · E: Remove · P: Paint <br/>
                    Cmd+Z: Undo · Cmd+Y: Redo
                </p>
            </div>
        </div>
    );
}