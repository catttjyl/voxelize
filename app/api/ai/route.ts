import OpenAI from 'openai';
import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from 'next/server';
import { MATERIAL_COLORS_GENERATED } from '@/constants/materials';
import { GRID_SIZE } from '@/constants/grid';
import { GeneratedVoxel } from '@/lib/voxel/types';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `
You are a voxel architect for a housing design tool. Given a building description, output ONLY a JSON array of placement commands {response: []}. No explanation, no markdown — just the JSON array. The voxel grid range is 32x32x32, each voxel is 1 unit in size.

Available commands:
- { "type": "floor", "x": number, "y": number, "z": number, "width": number, "length": number, "material": string }
- { "type": "walls", "x": number, "y": number, z": number, "width": number, "length": number, "height": number, "material": string }
- { "type": "window", "x": number, "y": number, "z": number, "width": number, "height": number, "face": "front|back|left|right" }
- { "type": "door", "x": number, "y": number, "z": number, "width": number, "height": number, "face": "front|back|left|right", "material": string }
- { "type": "gableRoof", "x": number, "z": number, "width": number, "length": number, "y": number, "material": string }
- { "type": "hipRoof", "x": number, "z": number, "width": number, "length": number, "y": number, "material": string }
- { "type": "flatRoof", "x": number, "z": number, "width": number, "length": number, "y": number, "material": string }
- { "type": "box", "x": number, "y": number, "z": number, "width": number, "height": number, "length": number, "material": string }
- { "type": "column", "x": number, "y": number, "z": number, "height": number, "material": string }

Materials: brick, wood_siding, clapboard, stucco, stone, concrete, glass, door_wood, door_red, roof_shingle, roof_tile, roof_slate, foundation, floor_wood, trim, garage_door, metal, column

Rules:
- First floor walls start at y=1
- Each story is 4-6 blocks tall (walls height=4-6)
- Place floors between stories
- Windows and doors go IN walls (same z as front wall for front face)
- Match architectural style to description
- Each house must have a roof unless it has a rooftop terrace.
- Keep proportions realistic`;

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();
  if (!prompt || typeof prompt !== 'string') {
    return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not set' }, { status: 500 });
  }

  let raw: string;
  try {
    const completion = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [
        { role: 'user', content: `Generate voxels for: ${prompt}` },
      ],
    });
    raw = completion.content[0]?.type === 'text' ? completion.content[0].text : '';
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Anthropic error: ${msg}` }, { status: 502 });
  }

  // simulate network delay
  // await new Promise((r) => setTimeout(r, 3000));

  let voxels: GeneratedVoxel[];
  try {
    const cleaned = raw
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();
    const parsed = JSON.parse(cleaned);
    voxels = Array.isArray(parsed) ? parsed : parsed.response;
    if (!Array.isArray(voxels)) {
      console.log("entered error");
      throw new Error('Not an array');
    }
    console.log("voxels", voxels);
  } catch (err){
    console.log("error", err);
    return NextResponse.json({ error: 'Invalid AI response' + raw }, { status: 502 });
  }

  const VALID_MATERIALS = new Set(Object.keys(MATERIAL_COLORS_GENERATED));

  const validated = voxels
    .filter((v) => {
      if (typeof v !== 'object' || v === null) return false;
      const { x, y, z, material } = v;
      return (
        typeof x === 'number' &&
        typeof y === 'number' &&
        typeof z === 'number' &&
        (material === undefined ||
        (typeof material === 'string' &&
        VALID_MATERIALS.has(material))) &&
        x <= GRID_SIZE &&
        z <= GRID_SIZE
      );
    });

  return NextResponse.json({ voxels: validated });
}
