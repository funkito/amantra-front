import type { BuilderStylePreset } from '@/lib/builder/types';

export interface BuilderStylePresetDefinition {
  id: BuilderStylePreset;
  label: string;
  bgColor: string;
  textColor: string;
  accentColor: string;
}

export const builderStylePresets: BuilderStylePresetDefinition[] = [
  {
    id: 'default',
    label: 'Base',
    bgColor: '#111111',
    textColor: '#f5eddf',
    accentColor: '#d4af37',
  },
  {
    id: 'warm',
    label: 'Cálido',
    bgColor: '#1b130e',
    textColor: '#f7efe2',
    accentColor: '#f2c86b',
  },
  {
    id: 'editorial',
    label: 'Editorial',
    bgColor: '#140f13',
    textColor: '#f4edf8',
    accentColor: '#d3b5ff',
  },
  {
    id: 'contrast',
    label: 'Contraste',
    bgColor: '#f4ead8',
    textColor: '#18120d',
    accentColor: '#a86c16',
  },
];

export function getBuilderStylePreset(presetId?: BuilderStylePreset) {
  return builderStylePresets.find((preset) => preset.id === presetId) ?? builderStylePresets[0];
}
