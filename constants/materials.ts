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
