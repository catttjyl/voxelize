## Project Overview

Browser-based voxel editor.

**Core loop:**

- Click to place a colored cube, click to remove it, navigate in 3D.
- Support undo and redo
- Face-aware placement on existing voxels

**Extend Features:** AI generate voxelized building structure or dynamically search in existing 3d building datasets with given text description.

---

## Tech Stack

| Layer              | Choice                      | Notes                                     |
| ------------------ | --------------------------- | ----------------------------------------- |
| Framework          | **Next.js** (App Router)    | TypeScript strict mode                    |
| 3D Rendering       | **React Three Fiber (R3F)** | `@react-three/fiber`, `@react-three/drei` |
| State              | **Zustand**                 | Single store, sliced by concern           |
| Styling            | **Tailwind CSS**            | UI panels only; 3D canvas is R3F          |
| AI (text-to-voxel) | OpenAI                      | Abstract behind a provider interface      |

---

## Architecture & Folder Structure

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx            # Main editor page
│   ├── layout.tsx
│   └── api/                # API routes
│       ├── ai/             # LLM proxy endpoints (Claude, OpenAI)
│       └── collab/         # Collaboration endpoints (future)
│
├── components/
│   ├── canvas/             # R3F 3D scene components
│   │   ├── VoxelScene.tsx  # Top-level <Canvas> wrapper
│   │   ├── GhostVoxel.tsx  # Hover preview before placement
│   │   ├── Lighting.tsx    # Lights + ambient occlusion
│   │   └── CameraControls.tsx  # Orbit/pan/zoom
│   │
│   └── ui/                 # 2D overlay panels (Tailwind)
│       ├── Toolbar.tsx     # Tool selection (place/remove/paint/etc.)
│       ├── ColorPicker.tsx # Palette + custom color
│       ├── MaterialBrush.tsx   # Material type selector
│       ├── AIPromptBar.tsx     # Text-to-voxel input
│       └── LayerPanel.tsx      # Y-level / floor visibility
│
├── store/                  # Zustand store slices
│   ├── index.ts            # Combined store
│   ├── voxelSlice.ts       # Voxel grid data (Map<string, VoxelData>)
│   ├── toolSlice.ts        # Active tool, color, material
│   └── historySlice.ts     # Undo/redo stack
│
├── lib/
│   └── voxel/
│       └── types.ts        # VoxelData, Position, Material enums
│
├── hooks/                  # Custom React hooks
│   ├── useVoxelInteraction.ts  # Raycasting + place/remove logic
│   ├── useKeyboardShortcuts.ts
│   └── useUndoRedo.ts
│
└── constants/
    ├── materials.ts        # Material definitions (wood, concrete, glass, etc.)
    ├── colors.ts           # Default palette (housing-oriented)
    └── grid.ts             # Grid size, voxel scale constants

```

---

## Commands

```bash
npm run dev        # Local dev server
npm run build      # Production build (catches TS errors)
npm run lint       # ESLint
npm run test       # Vitest
```

---

## Future

- [ ] Preset library
- [ ] GIS overlay (Deck.gl + Maplibre + Austin parcels)
- [ ] Live collaboration
