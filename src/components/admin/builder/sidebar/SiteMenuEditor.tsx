'use client';

import type { CSSProperties } from 'react';
import type { BuilderBlockContent, BuilderBlockNode } from '@/lib/builder/types';
import { usePageBuilderStore } from '@/lib/store/usePageBuilderStore';

interface SiteMenuEditorProps {
  block: BuilderBlockNode;
}

type SiteMenuContentKey = keyof Pick<
  BuilderBlockContent,
  | 'brandName'
  | 'logoUrl'
  | 'ctaLabel'
  | 'ctaHref'
  | 'menuBackgroundColor'
  | 'menuTextColor'
  | 'menuLinkColor'
  | 'menuLinkBorderColor'
  | 'menuCtaBackgroundColor'
  | 'menuCtaTextColor'
  | 'searchPlaceholder'
  | 'instagramUrl'
  | 'facebookUrl'
  | 'tiktokUrl'
>;

const colorFields: Array<{ key: SiteMenuContentKey; label: string; fallback: string }> = [
  { key: 'menuBackgroundColor', label: 'Fondo del menú', fallback: '#ffffff' },
  { key: 'menuTextColor', label: 'Marca / texto', fallback: '#4b4038' },
  { key: 'menuLinkColor', label: 'Color de links', fallback: '#6f6659' },
  { key: 'menuLinkBorderColor', label: 'Borde de links', fallback: '#d8c296' },
  { key: 'menuCtaBackgroundColor', label: 'Fondo CTA', fallback: '#f2c86b' },
  { key: 'menuCtaTextColor', label: 'Texto CTA', fallback: '#140e0a' },
];

export default function SiteMenuEditor({ block }: SiteMenuEditorProps) {
  const updateBlockContent = usePageBuilderStore((state) => state.updateBlockContent);

  function updateContent(key: SiteMenuContentKey, value: string) {
    updateBlockContent(block.id, { [key]: value });
  }

  return (
    <section style={panelStyle}>
      <div>
        <div style={sectionKickerStyle}>Menú principal</div>
        <p style={helperStyle}>
          Estos valores controlan el menú superior en el preview y en el sitio público.
        </p>
      </div>

      <TextField
        label="Nombre de marca"
        value={block.content.brandName ?? block.content.title ?? ''}
        onChange={(value) => {
          updateBlockContent(block.id, { brandName: value, title: value });
        }}
        placeholder="AMANTRA"
      />

      <TextField
        label="URL del logo"
        value={block.content.logoUrl ?? ''}
        onChange={(value) => updateContent('logoUrl', value)}
        placeholder="https://res.cloudinary.com/.../logo.png"
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

      <div style={gridStyle}>
        <TextField
          label="Texto CTA"
          value={block.content.ctaLabel ?? ''}
          onChange={(value) => updateContent('ctaLabel', value)}
          placeholder="Explorar colección"
        />
        <TextField
          label="Enlace CTA"
          value={block.content.ctaHref ?? ''}
          onChange={(value) => updateContent('ctaHref', value)}
          placeholder="/#catalogo"
        />
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#D7D0C3' }}>
        <input
          type="checkbox"
          checked={block.content.showSearch ?? true}
          onChange={(event) => updateBlockContent(block.id, { showSearch: event.target.checked })}
        />
        Mostrar buscador
      </label>

      <TextField
        label="Placeholder del buscador"
        value={block.content.searchPlaceholder ?? ''}
        onChange={(value) => updateContent('searchPlaceholder', value)}
        placeholder="Buscar"
      />

      <div style={sectionKickerStyle}>Redes sociales</div>
      <TextField
        label="Instagram"
        value={block.content.instagramUrl ?? ''}
        onChange={(value) => updateContent('instagramUrl', value)}
        placeholder="https://instagram.com/..."
      />
      <TextField
        label="Facebook"
        value={block.content.facebookUrl ?? ''}
        onChange={(value) => updateContent('facebookUrl', value)}
        placeholder="https://facebook.com/..."
      />
      <TextField
        label="TikTok"
        value={block.content.tiktokUrl ?? ''}
        onChange={(value) => updateContent('tiktokUrl', value)}
        placeholder="https://tiktok.com/@..."
      />
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
