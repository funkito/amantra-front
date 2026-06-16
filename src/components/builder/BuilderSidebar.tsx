'use client';

import { useMemo, useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Columns2, Image, LayoutPanelTop, MailPlus, Menu, Search, SquareStack, TextCursorInput, ToyBrick } from 'lucide-react';
import { builderBlockCategories, builderSectionTemplates } from '@/lib/builder/block-library';
import { availableBuilderBlocks, usePageBuilderStore } from '@/lib/store/usePageBuilderStore';
import type { BuilderBlockDefinition } from '@/lib/builder/types';

const iconMap = {
  'panel-top': LayoutPanelTop,
  menu: Menu,
  'square-stack': SquareStack,
  'columns-2': Columns2,
  'grid-2x2': ToyBrick,
  'text-cursor-input': TextCursorInput,
  image: Image,
  'mail-plus': MailPlus,
};

function PaletteItem({ block }: { block: BuilderBlockDefinition }) {
  const addBlock = usePageBuilderStore((state) => state.addBlock);
  const Icon = iconMap[block.icon as keyof typeof iconMap] ?? ToyBrick;
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette:${block.type}`,
    data: {
      source: 'palette',
      blockType: block.type,
    },
  });

  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={() => addBlock(block.type)}
      style={{
        width: '100%',
        textAlign: 'left',
        borderRadius: 18,
        border: '1px solid rgba(212,175,55,0.1)',
        padding: '14px 14px 14px 16px',
        background: isDragging ? 'rgba(212,175,55,0.14)' : 'rgba(255,255,255,0.02)',
        cursor: 'grab',
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
      }}
      {...listeners}
      {...attributes}
    >
      <div style={{ display: 'flex', gap: 12 }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            display: 'grid',
            placeItems: 'center',
            background: 'rgba(212,175,55,0.1)',
            color: '#D4AF37',
            flexShrink: 0,
          }}
        >
          <Icon size={18} />
        </div>
        <div>
          <div style={{ color: '#FFFFF0', fontWeight: 700 }}>{block.label}</div>
          <div style={{ color: '#BDBDBD', lineHeight: 1.55, marginTop: 4, fontSize: 13 }}>{block.description}</div>
        </div>
      </div>
    </button>
  );
}

function TemplateItem({
  template,
}: {
  template: (typeof builderSectionTemplates)[number];
}) {
  const addTemplate = usePageBuilderStore((state) => state.addTemplate);

  return (
    <button
      type="button"
      onClick={() => addTemplate(template.id)}
      style={{
        width: '100%',
        textAlign: 'left',
        borderRadius: 18,
        border: '1px solid rgba(212,175,55,0.12)',
        padding: '14px 16px',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.02))',
        cursor: 'pointer',
      }}
    >
      <div style={{ color: '#D4AF37', fontWeight: 700 }}>{template.label}</div>
      <div style={{ color: '#BDBDBD', lineHeight: 1.6, marginTop: 6, fontSize: 13 }}>{template.description}</div>
      <div style={{ marginTop: 10, color: '#8f846d', fontSize: 12 }}>
        {template.blocks.length} bloques coordinados
      </div>
    </button>
  );
}

export default function BuilderSidebar() {
  const [query, setQuery] = useState('');
  const filteredBlocks = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return availableBuilderBlocks;
    }

    return availableBuilderBlocks.filter((block) =>
      [block.label, block.description, block.category].join(' ').toLowerCase().includes(normalized)
    );
  }, [query]);

  return (
    <aside
      style={{
        display: 'grid',
        gap: 20,
        padding: 20,
        borderRadius: 24,
        background: '#111111',
        border: '1px solid rgba(212,175,55,0.14)',
        alignSelf: 'start',
      }}
    >
      <div>
        <div style={{ color: '#D4AF37', fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
          Paleta
        </div>
        <h2 style={{ margin: '10px 0 6px', color: '#FFFFF0', fontSize: 26 }}>Bloques base</h2>
        <p style={{ margin: 0, color: '#BDBDBD', lineHeight: 1.7 }}>
          Arrastra al canvas o haz click para insertar. También puedes empezar con composiciones listas para marketing, storytelling o catálogo.
        </p>
      </div>

      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          borderRadius: 16,
          border: '1px solid rgba(212,175,55,0.12)',
          background: 'rgba(255,255,255,0.02)',
          padding: '12px 14px',
        }}
      >
        <Search size={16} color="#D4AF37" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar bloque"
          style={{
            width: '100%',
            background: 'transparent',
            border: 0,
            outline: 'none',
            color: '#FFFFF0',
          }}
        />
      </label>

      <div style={{ display: 'grid', gap: 18 }}>
        <section style={{ display: 'grid', gap: 10 }}>
          <div style={{ color: '#D4AF37', fontWeight: 700 }}>Composiciones</div>
          <div style={{ display: 'grid', gap: 10 }}>
            {builderSectionTemplates.map((template) => (
              <TemplateItem key={template.id} template={template} />
            ))}
          </div>
        </section>

        {builderBlockCategories.map((category) => {
          const blocks = filteredBlocks.filter((block) => block.category === category.key);

          if (blocks.length === 0) {
            return null;
          }

          return (
            <section key={category.key} style={{ display: 'grid', gap: 10 }}>
              <div style={{ color: '#D4AF37', fontWeight: 700 }}>{category.label}</div>
              <div style={{ display: 'grid', gap: 10 }}>
                {blocks.map((block) => (
                  <PaletteItem key={block.type} block={block} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </aside>
  );
}
