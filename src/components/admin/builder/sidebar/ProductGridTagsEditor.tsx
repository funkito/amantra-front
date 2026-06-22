'use client';

import type { CSSProperties } from 'react';
import type { BuilderBlockContent, BuilderBlockNode } from '@/lib/builder/types';
import { usePageBuilderStore } from '@/lib/store/usePageBuilderStore';

interface ProductGridTagsEditorProps {
  block: BuilderBlockNode;
}

type ProductGridTagKey = keyof Pick<
  BuilderBlockContent,
  | 'productTagAllLabel'
  | 'productTagTileBackgroundColor'
  | 'productTagTileTextColor'
  | 'productTagTileActiveBackgroundColor'
  | 'productTagTileActiveTextColor'
  | 'productTagTileBorderColor'
  | 'productTagTileOverlayColor'
>;

const colorFields: Array<{ key: ProductGridTagKey; label: string; fallback: string }> = [
  { key: 'productTagTileBackgroundColor', label: 'Fondo tarjeta', fallback: '#fbf4e8' },
  { key: 'productTagTileTextColor', label: 'Texto tarjeta', fallback: '#31513d' },
  { key: 'productTagTileActiveBackgroundColor', label: 'Fondo activo', fallback: '#f2dfb3' },
  { key: 'productTagTileActiveTextColor', label: 'Texto activo', fallback: '#140e0a' },
  { key: 'productTagTileBorderColor', label: 'Borde', fallback: '#d8c296' },
  { key: 'productTagTileOverlayColor', label: 'Capa sobre imagen', fallback: 'rgba(255,248,235,0.52)' },
];

export default function ProductGridTagsEditor({ block }: ProductGridTagsEditorProps) {
  const updateBlockContent = usePageBuilderStore((state) => state.updateBlockContent);

  function updateContent(key: ProductGridTagKey, value: string) {
    updateBlockContent(block.id, { [key]: value });
  }

  return (
    <section style={panelStyle}>
      <div>
        <div style={sectionKickerStyle}>Etiquetas visuales</div>
        <p style={helperStyle}>
          Convierte las etiquetas del catálogo en tarjetas editables con imagen, color y estado activo.
        </p>
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#D7D0C3' }}>
        <input
          type="checkbox"
          checked={(block.content.productTagStyle ?? 'tiles') === 'tiles'}
          onChange={(event) =>
            updateBlockContent(block.id, {
              productTagStyle: event.target.checked ? 'tiles' : 'chips',
            })
          }
        />
        Usar tarjetas con imagen
      </label>

      <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#D7D0C3' }}>
        <input
          type="checkbox"
          checked={block.content.productTagShowImages ?? true}
          onChange={(event) =>
            updateBlockContent(block.id, {
              productTagShowImages: event.target.checked,
            })
          }
        />
        Mostrar imagen de producto en cada etiqueta
      </label>

      <TextField
        label="Texto para botón de todas"
        value={block.content.productTagAllLabel ?? ''}
        onChange={(value) => updateContent('productTagAllLabel', value)}
        placeholder="Todas"
      />

      <div style={gridStyle}>
        {colorFields.map((field) => (
          <ColorField
            key={field.key}
            label={field.label}
            value={(block.content[field.key] as string | undefined) || field.fallback}
            onChange={(value) => updateContent(field.key, value)}
          />
        ))}
      </div>
    </section>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label style={labelStyle}>
      <span style={labelTextStyle}>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} style={fieldStyle} />
    </label>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const safeColor = value.startsWith('#') ? value : '#ffffff';

  return (
    <label style={labelStyle}>
      <span style={labelTextStyle}>{label}</span>
      <div style={{ display: 'grid', gridTemplateColumns: '42px minmax(0, 1fr)', gap: 8 }}>
        <input type="color" value={safeColor} onChange={(event) => onChange(event.target.value)} style={colorInputStyle} />
        <input value={value} onChange={(event) => onChange(event.target.value)} style={fieldStyle} />
      </div>
    </label>
  );
}

const panelStyle: CSSProperties = {
  display: 'grid',
  gap: 12,
  borderRadius: 18,
  border: '1px solid rgba(212,175,55,0.1)',
  background: 'rgba(255,255,255,0.025)',
  padding: 14,
};

const sectionKickerStyle: CSSProperties = {
  color: '#D4AF37',
  fontSize: 13,
  fontWeight: 800,
};

const helperStyle: CSSProperties = {
  margin: '6px 0 0',
  color: '#BDBDBD',
  fontSize: 12,
  lineHeight: 1.55,
};

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: 10,
};

const labelStyle: CSSProperties = {
  display: 'grid',
  gap: 6,
};

const labelTextStyle: CSSProperties = {
  color: '#D4AF37',
  fontSize: 12,
};

const fieldStyle: CSSProperties = {
  width: '100%',
  border: '1px solid rgba(212,175,55,0.12)',
  background: 'rgba(255,255,255,0.02)',
  color: '#FFFFF0',
  borderRadius: 12,
  padding: '9px 10px',
  outline: 'none',
};

const colorInputStyle: CSSProperties = {
  width: '42px',
  minWidth: '42px',
  height: '38px',
  border: '1px solid rgba(212,175,55,0.12)',
  borderRadius: 12,
  background: 'transparent',
  padding: 2,
  cursor: 'pointer',
};
