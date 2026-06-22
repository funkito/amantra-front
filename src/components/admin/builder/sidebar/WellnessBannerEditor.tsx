'use client';

import type { CSSProperties } from 'react';
import type { BuilderBlockNode, BuilderBlockContent } from '@/lib/builder/types';
import { usePageBuilderStore } from '@/lib/store/usePageBuilderStore';

interface WellnessBannerEditorProps {
  block: BuilderBlockNode;
}

type EditableContentKey = keyof Pick<
  BuilderBlockContent,
  | 'eyebrow'
  | 'title'
  | 'body'
  | 'image'
  | 'ctaLabel'
  | 'ctaHref'
  | 'secondaryCtaLabel'
  | 'secondaryCtaHref'
  | 'bannerBackgroundColor'
  | 'bannerTextColor'
  | 'bannerAccentColor'
  | 'bannerMutedColor'
  | 'benefitOneTitle'
  | 'benefitOneBody'
  | 'benefitTwoTitle'
  | 'benefitTwoBody'
  | 'benefitThreeTitle'
  | 'benefitThreeBody'
>;

const colorFields: Array<{ key: EditableContentKey; label: string; fallback: string }> = [
  { key: 'bannerBackgroundColor', label: 'Fondo del banner', fallback: '#fbf4e8' },
  { key: 'bannerTextColor', label: 'Texto principal', fallback: '#46352c' },
  { key: 'bannerAccentColor', label: 'Color de botones', fallback: '#c4912d' },
  { key: 'bannerMutedColor', label: 'Texto suave', fallback: '#6f6659' },
];

const benefitFields = [
  { title: 'benefitOneTitle', body: 'benefitOneBody', label: 'Beneficio 1' },
  { title: 'benefitTwoTitle', body: 'benefitTwoBody', label: 'Beneficio 2' },
  { title: 'benefitThreeTitle', body: 'benefitThreeBody', label: 'Beneficio 3' },
] as const;

export default function WellnessBannerEditor({ block }: WellnessBannerEditorProps) {
  const updateBlockContent = usePageBuilderStore((state) => state.updateBlockContent);

  function updateContent(key: EditableContentKey, value: string) {
    updateBlockContent(block.id, { [key]: value });
  }

  return (
    <section style={panelStyle}>
      <div>
        <div style={sectionKickerStyle}>Banner bienestar</div>
        <p style={helperStyle}>
          Controla el banner completo: textos, botones, colores, beneficios e imagen lateral.
        </p>
      </div>

      <TextField
        label="Texto superior pequeño"
        value={block.content.eyebrow ?? ''}
        onChange={(value) => updateContent('eyebrow', value)}
        placeholder="BIENESTAR PARA LLEVAR CONTIGO"
      />

      <TextField
        label="Título principal"
        value={block.content.title ?? ''}
        onChange={(value) => updateContent('title', value)}
        placeholder="Armonía para tu cuerpo, mente y espíritu"
      />

      <TextAreaField
        label="Descripción"
        value={block.content.body ?? ''}
        onChange={(value) => updateContent('body', value)}
      />

      <TextField
        label="URL de imagen lateral"
        value={block.content.image ?? ''}
        onChange={(value) => updateContent('image', value)}
        placeholder="https://res.cloudinary.com/..."
      />

      <div style={gridStyle}>
        <TextField
          label="Botón principal"
          value={block.content.ctaLabel ?? ''}
          onChange={(value) => updateContent('ctaLabel', value)}
          placeholder="Explorar tienda"
        />
        <TextField
          label="Enlace principal"
          value={block.content.ctaHref ?? ''}
          onChange={(value) => updateContent('ctaHref', value)}
          placeholder="/#catalogo"
        />
      </div>

      <div style={gridStyle}>
        <TextField
          label="Botón secundario"
          value={block.content.secondaryCtaLabel ?? ''}
          onChange={(value) => updateContent('secondaryCtaLabel', value)}
          placeholder="Descubrir rituales"
        />
        <TextField
          label="Enlace secundario"
          value={block.content.secondaryCtaHref ?? ''}
          onChange={(value) => updateContent('secondaryCtaHref', value)}
          placeholder="/blog"
        />
      </div>

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

      <div style={{ display: 'grid', gap: 10 }}>
        <div style={sectionKickerStyle}>Beneficios inferiores</div>
        {benefitFields.map((benefit) => (
          <div key={benefit.label} style={benefitCardStyle}>
            <div style={{ color: '#D4AF37', fontSize: 12, fontWeight: 800 }}>{benefit.label}</div>
            <TextField
              label="Título"
              value={block.content[benefit.title] ?? ''}
              onChange={(value) => updateContent(benefit.title, value)}
            />
            <TextAreaField
              label="Texto"
              value={block.content[benefit.body] ?? ''}
              onChange={(value) => updateContent(benefit.body, value)}
              rows={2}
            />
          </div>
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

function TextAreaField({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <label style={labelStyle}>
      <span style={labelTextStyle}>{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        style={{ ...fieldStyle, resize: 'vertical' }}
      />
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
  return (
    <label style={labelStyle}>
      <span style={labelTextStyle}>{label}</span>
      <div style={{ display: 'grid', gridTemplateColumns: '42px minmax(0, 1fr)', gap: 8 }}>
        <input type="color" value={value} onChange={(event) => onChange(event.target.value)} style={colorInputStyle} />
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

const benefitCardStyle: CSSProperties = {
  display: 'grid',
  gap: 8,
  borderRadius: 16,
  border: '1px solid rgba(212,175,55,0.1)',
  background: 'rgba(0,0,0,0.18)',
  padding: 12,
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
