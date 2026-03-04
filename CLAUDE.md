# Claude.md — Cedar Voxel Editor

## Project Overview

Browser-based voxel editor for **Cedar's Summer Internship Tech Challenge**. Cedar builds software for housing delivery — 3D geometry, spatial data, real-time interfaces. This tool should feel like a lightweight MagicaVoxel in the browser, but opinionated toward **housing design workflows**: placing walls, roofs, rooms, and structures on real-world parcels.

**Core loop:** Click to place a colored cube, click to remove it, navigate in 3D.

**Domain angle:** This isn't a generic voxel toy. Think from the perspective of architects, designers, and engineers accelerating housing development. Every feature should ask: "Does this help someone design and build houses faster?"

**Deployment target:** Vercel free tier.

---

## Tech Stack

| Layer              | Choice                                                 | Notes                                                               |
| ------------------ | ------------------------------------------------------ | ------------------------------------------------------------------- |
| Framework          | **Next.js** (App Router)                               | TypeScript strict mode                                              |
| 3D Rendering       | **React Three Fiber (R3F)**                            | `@react-three/fiber`, `@react-three/drei`                           |
| State              | **Zustand**                                            | Single store, sliced by concern                                     |
| Styling            | **Tailwind CSS**                                       | UI panels only; 3D canvas is R3F                                    |
| AI (text-to-voxel) | **Flexible** — Anthropic Claude + OpenAI               | Abstract behind a provider interface                                |
| GIS / Geolocation  | **Maplibre** for basemap + **Deck.gl** for data layers | Austin, TX focus for demo; overlay voxel structures on real parcels |
| Collaboration      | **TBD**                                                | Evaluate: Liveblocks, Yjs+WebSocket, or Supabase Realtime           |
| Testing            | Vitest + React Testing Library                         | Unit for store logic; visual regression optional                    |

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
│   ├── ui/                 # 2D overlay panels (Tailwind)
│   │   ├── Toolbar.tsx     # Tool selection (place/remove/paint/etc.)
│   │   ├── ColorPicker.tsx # Palette + custom color
│   │   ├── MaterialBrush.tsx   # Material type selector
│   │   ├── PresetLibrary.tsx   # Searchable preset structures
│   │   ├── AIPromptBar.tsx     # Text-to-voxel input
│   │   ├── LayerPanel.tsx      # Y-level / floor visibility
│   │   ├── GISView.tsx      # Maplibre map with Deck.gl layers
│   │   └── CollabPresence.tsx  # Avatars / cursors (future)
│   │
│   └── shared/             # Reusable primitives
│
├── store/                  # Zustand store slices
│   ├── index.ts            # Combined store
│   ├── voxelSlice.ts       # Voxel grid data (Map<string, VoxelData>)
│   ├── toolSlice.ts        # Active tool, color, material
│   ├── historySlice.ts     # Undo/redo stack
│   ├── cameraSlice.ts      # Camera state (for collab sync)
│   ├── aiSlice.ts          # AI generation state
│   └── collabSlice.ts      # Collaboration state (future)
│
├── lib/
│   ├── voxel/
│   │   └── types.ts        # VoxelData, Position, Material enums
│   │
│   ├── ai/
│   │   ├── provider.ts     # Abstract AI provider interface
│   │   ├── claude.ts       # Anthropic adapter
│   │   ├── openai.ts       # OpenAI adapter
│   │   ├── prompts.ts      # System prompts for voxel generation
│   │   └── parser.ts       # LLM output → voxel array
│   │
│   ├── gis/
│   │   ├── deckOverlay.ts  # Deck.gl (parcel polygons, voxel footprints)
│   │   ├── maplibreConfig.ts   # basemap, initial viewport (centered on Austin)
│   │   ├── parcels.ts      # Austin parcel data loading
│   │   └── projection.ts   # Lat/lng → voxel grid mapping
│   │
│   ├── presets/
│   │   ├── library.ts      # Built-in structure presets (walls, roofs, stairs, windows)
│   │   └── search.ts       # AI-assisted fuzzy search over presets
│   │
│   └── collab/             # Future: CRDT / real-time sync
│       ├── provider.ts
│       └── awareness.ts
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

## Key Architecture Decisions

### 1. Voxel Storage: `Map<string, VoxelData>` with string keys `"x,y,z"`

**Why:** Sparse representation — most of the grid is empty. O(1) lookup. Easy to serialize. Tried arrays first but they waste memory and complicate non-contiguous structures.

### 2. InstancedMesh for rendering (not individual meshes)

**Why:** Individual `<mesh>` per voxel kills performance past ~200 voxels. InstancedMesh renders 10,000+ cubes in a single draw call. Group instances by material/color for efficient batching.
**Rule:** Never render individual `<mesh>` for voxels. Always go through the instancing layer.

### 3. Face-aware placement (click face → place adjacent)

**Why:** MagicaVoxel-style UX. When clicking a voxel, detect _which face_ was hit and place the new voxel on that face. Use `raycaster.intersectObjects` → check `face.normal` to compute adjacent position.

### 4. Undo/redo as operation stack, not full-state snapshots

**Why:** Storing full grid state per action doesn't scale. Instead, store `{ type: 'place', position, voxel }` / `{ type: 'remove', position, previousVoxel }` operations. Replay forward/backward.

### 5. AI provider abstraction

**Why:** Challenge says "AI-assisted" — we want to demo flexibility. Both Claude and OpenAI can generate voxel coordinate arrays from text prompts. The `provider.ts` interface returns `VoxelData[]` regardless of backend. System prompt instructs the LLM to output a JSON array of `{x, y, z, color, material}`.

### 6. GIS as overlay mode, not default view

**Why:** The editor is voxel-first. GIS (Maplibre/Deck.gl + Austin parcels) is a _context layer_ you toggle on to see where your structure sits on a real lot. The voxel grid's origin maps to a parcel centroid. Keep the two renderers (R3F + Maplibre/Deck.gl) composited but independent.

### 7. Zustand slices over a monolithic store

**Why:** Collab, AI, and history all have async concerns. Slices keep them isolated and testable. Use `subscribeWithSelector` for cross-slice reactivity.

---

## Recurring Mistakes & Rules

### ALWAYS

- Use **InstancedMesh** for voxel rendering. Never individual meshes.
- Key voxel positions as strings `"x,y,z"` — parse with `key.split(',').map(Number)`.
- Keep R3F components **purely declarative** — no imperative Three.js in React components. Use `useFrame`, `useThree`, refs.
- Memoize heavily in R3F — every re-render is expensive. Use `React.memo`, `useMemo` on geometries/materials.
- Dispose of Three.js geometries and materials in cleanup (`useEffect` return).
- Handle the **pointer lock / orbit conflict**: orbit controls should NOT activate during voxel placement clicks. Use `e.stopPropagation()` on the voxel interaction layer.
- AI-generated voxel arrays must be **validated and bounds-checked** before insertion into the store.
- All API keys go in `.env.local`, never committed. The AI route handlers in `app/api/ai/` proxy requests.

### NEVER

- Don't put Three.js objects in Zustand state (they're not serializable). Store position/color/material data only.
- Don't use `useState` for voxel data — always Zustand. React state causes full re-renders.
- Don't use `@react-three/cannon` or physics — we don't need it and it adds weight.
- Don't block the main thread with large voxel operations. Use `requestIdleCallback` or chunk large fills.
- Don't import Three.js directly in non-canvas components — keep the bundle split clean.

### GOTCHAS

- **R3F `<Canvas>` must not be SSR'd.** Wrap in `dynamic(() => import(...), { ssr: false })` or a client component boundary.
- **Drei's `<OrbitControls>` conflicts with custom pointer events.** Set `makeDefault` and use `enabled` prop to toggle.
- **InstancedMesh color requires `instanceColor` attribute** — set via `mesh.setColorAt(index, color)` then `mesh.instanceColor.needsUpdate = true`.
- **Zustand `subscribeWithSelector` middleware** must wrap `devtools`, not the other way around.
- **Next.js App Router**: R3F and Drei are client-only. Every component touching Three.js needs `'use client'` at the top, or must be imported dynamically.
- **Deck.gl + R3F coexistence**: They manage separate WebGL contexts. Layer the Deck.gl canvas behind/beside the R3F canvas; don't try to merge them into one context.

---

## Housing-Domain Feature Notes

**Materials palette:** Not just colors — materials matter for housing. Default palette includes: wood framing, concrete/CMU, glass, steel, drywall, roofing, insulation. Each material has a color + texture hint + metadata (structural vs. finish).

**Preset library:** Reusable housing components — wall segments, window openings, door frames, roof pitches (gable, hip, flat), stair runs, foundation slabs. These are small voxel patterns (3-20 voxels) that snap to the grid. AI search lets users type "double-hung window 3ft wide" and get the closest preset.

**Floor/layer system:** Buildings are designed floor-by-floor. The layer panel lets you isolate Y-levels, show a single floor plan view, or ghost upper floors at reduced opacity. This is critical for housing — architects think in plan, not 3D, most of the time.

**GIS context (Austin):** Toggle a map underlay showing real Austin parcels. Snap your voxel grid to a lot boundary. Voxel scale maps to real-world feet (1 voxel = 1 ft or similar configurable scale). This lets you prototype "does this house fit on this lot?"

---

## Collaboration Design Notes (Future)

The collab system should sync the **voxel store operations**, not raw state. This naturally supports:

- Conflict resolution (last-write-wins per voxel position)
- Awareness (cursor position, selected tool, user color)
- Efficient bandwidth (operations are small; full state is large)

Evaluate Yjs for CRDT-based sync (works offline, no server needed for conflict resolution) vs. Liveblocks (hosted, easier setup, React hooks built-in).

---

## Performance Budget

| Metric              | Target                          |
| ------------------- | ------------------------------- |
| Voxel count         | 10,000+ without frame drops     |
| First paint         | < 2s on Vercel                  |
| Interaction latency | < 16ms (60fps) for place/remove |
| Bundle size         | < 500KB gzipped (initial load)  |

**Key perf techniques:** InstancedMesh batching, frustum culling (built into Three.js), greedy meshing (stretch goal for large flat surfaces), Web Workers for AI response parsing and large operations.

---

## Commands

```bash
npm run dev        # Local dev server
npm run build      # Production build (catches TS errors)
npm run lint       # ESLint
npm run test       # Vitest
```

---

## Current Status

> Update this section as you work.

- [ ] Project scaffolding (Next.js + R3F + Zustand + Tailwind)
- [ ] Basic voxel grid — place/remove on ground plane
- [ ] Face-aware placement on existing voxels
- [ ] Color picker + material brush
- [ ] InstancedMesh rendering
- [ ] Orbit/pan/zoom controls
- [ ] Undo/redo
- [ ] Save/load (JSON)
- [ ] AI text-to-voxel
- [ ] Preset library + AI search
- [ ] Lighting + ambient occlusion
- [ ] Layer/floor panel
- [ ] GIS overlay (Deck.gl + Maplibre + Austin parcels)
- [ ] Live collaboration
- [ ] Deploy to Vercel
