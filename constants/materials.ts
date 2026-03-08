import { Material } from '@/lib/voxel/types';

export const MATERIAL_COLORS: Record<Material, string> = {
  [Material.Wood]: '#B68E65',
  [Material.Concrete]: '#95A5A6',
  [Material.Glass]: '#a8d8ea',
  [Material.Steel]: '#78909c',
  [Material.Granite]: '#837E7C',
  [Material.Marble]: '#F3FFFF',
  [Material.Brick]: '#BC4A3C',
  [Material.Tile]: '#5d4037',
};

export const MATERIAL_LABELS: Record<Material, string> = {
  [Material.Wood]: 'Wood',
  [Material.Concrete]: 'Concrete',
  [Material.Glass]: 'Glass',
  [Material.Steel]: 'Steel',
  [Material.Granite]: 'Granite',
  [Material.Marble]: 'Marble',
  [Material.Brick]: 'Brick',
  [Material.Tile]: 'Tile',
};

export const MATERIAL_COLORS_GENERATED: Record<string, string> = {
  brick:       "#8B4513",
  wood_siding: "#D2B48C",
  clapboard:   "#E8DCC8",
  stucco:      "#F5F0E1",
  stone:       "#808075",
  concrete:    "#A9A9A9",
  glass:       "#87CEEB",
  door_wood:   "#654321",
  door_red:    "#8B0000",
  roof_shingle:"#4A4A4A",
  roof_tile:   "#B8542E",
  roof_slate:  "#5A5A6A",
  foundation:  "#696969",
  floor_wood:  "#C4A777",
  column:        "#FFFEF2",
  grass:       "#4A7C3F",
  chimney:     "#6B6B6B",
  garage_door: "#B0B0B0",
  porch_rail:  "#F0EDE4",
};