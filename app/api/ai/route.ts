import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { Material } from '@/lib/voxel/types';
import { GRID_SIZE } from '@/constants/grid';

const SYSTEM_PROMPT = `You are a voxel architect. Given a description, you output a JSON array of voxels structures {voxels: [{x, y, z, color, material}]}. The voxel grid range is 32x32x32, each voxel is 1 unit in size .

Rules:
- Output ONLY a valid JSON object with a single key "voxels" containing the array, no explanation, no markdown.
- Each voxel: { "x": number, "y": 0, "z": number, "color": string of hex color code, "material": string }
- Use architectural knowledge: foundations go at y=0, walls are vertical columns of blocks, roofs cap the structure.
- material must be one of: "wood", "concrete", "glass", "steel", "granite", "marble", "brick", "tile"
- Materials map to colors: wood=#B68E65, concrete=#95A5A6, glass=#a8d8ea, steel=#78909c, granite=#837E7C, marble=#F3FFFF, brick=#BC4A3C, tile=#5d4037."

Output only the JSON array.`;

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();
  if (!prompt || typeof prompt !== 'string') {
    return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OPENAI_API_KEY not set' }, { status: 500 });
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  let raw: string;
  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 4096,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Generate voxels for: ${prompt}` },
      ],
      response_format: { type: 'json_object' },
    });
    raw = completion.choices[0]?.message?.content ?? '';
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `OpenAI error: ${msg}` }, { status: 502 });
  }

  // simulate network delay
  // await new Promise((r) => setTimeout(r, 3000));

  // test data
  // const raw = JSON.stringify([{ x: 0, y: 0, z: 0, color: '#B68E65', material: 'wood' }, { x: 1, y: 0, z: 0, color: '#95A5A6', material: 'concrete' }, { x: 2, y: 0, z: 0, color: '#a8d8ea', material: 'glass' }, { x: 3, y: 0, z: 0, color: '#78909c', material: 'steel' }, { x: 4, y: 0, z: 0, color: '#837E7C', material: 'granite' }, { x: 5, y: 0, z: 0, color: '#F3FFFF', material: 'marble' }, { x: 6, y: 0, z: 0, color: '#BC4A3C', material: 'brick' }, { x: 7, y: 0, z: 0, color: '#5d4037', material: 'tile' }]);
  
  let voxels: { x: number; y: number; z: number; color: string; material: string }[];
  try {
    const parsed = JSON.parse(raw);
    // json_object mode wraps in an object; accept { voxels: [...] } or direct array
    voxels = Array.isArray(parsed) ? parsed : parsed.voxels;
    if (!Array.isArray(voxels)) throw new Error('Not an array');
  } catch {
    return NextResponse.json({ error: 'Invalid AI response', raw }, { status: 502 });
  }

  const VALID_MATERIALS = new Set(Object.values(Material));
  const HEX_RE = /^#[0-9a-fA-F]{6}$/;

  const validated = voxels
    .filter((v): v is { x: number; y: number; z: number; color: string; material: string } => {
      if (typeof v !== 'object' || v === null) return false;
      const { x, y, z, color, material } = v;
      return (
        typeof x === 'number' &&
        typeof y === 'number' &&
        typeof z === 'number' &&
        typeof color === 'string' &&
        typeof material === 'string' &&
        HEX_RE.test(color) &&
        VALID_MATERIALS.has(material as Material) &&
        x <= GRID_SIZE &&
        z <= GRID_SIZE
      );
    });

  return NextResponse.json({ voxels: validated });
}
