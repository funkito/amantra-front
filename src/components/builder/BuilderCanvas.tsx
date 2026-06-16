'use client';

import { useMemo } from 'react';
import { DndContext, DragOverlay, PointerSensor, closestCenter, useDroppable, useSensor, useSensors, type DragEndEvent, type DragOverEvent, type DragStartEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, LayoutTemplate } from 'lucide-react';
import BuilderBlockPreview from '@/components/builder/blocks/BuilderBlockPreview';
import { getBlockDefinition } from '@/lib/builder/block-library';
import { getBuilderStylePreset } from '@/lib/builder/style-presets';
import { usePageBuilderStore } from '@/lib/store/usePageBuilderStore';
import type { BuilderBlockNode, BuilderBlockType } from '@/lib/builder/types';
import { useState } from 'react';

function SortableBlockCard({
  block,
  isSelected,
  onSelect,
  isDropTarget,
}: {
  block: BuilderBlockNode;
  isSelected: boolean;
  onSelect: () => void;
  isDropTarget: boolean;
}) {
  const removeBlock = usePageBuilderStore((state) => state.removeBlock);
  const preset = getBuilderStylePreset(block.props.stylePreset);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
    data: {
      source: 'canvas',
      blockId: block.id,
    },
  });

  return (
    <article
      ref={setNodeRef}
      onClick={onSelect}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        borderRadius: 24,
        border: isSelected ? '1px solid rgba(212,175,55,0.5)' : '1px solid rgba(212,175,55,0.12)',
        background: isDragging ? 'rgba(212,175,55,0.08)' : '#111111',
        boxShadow: isDropTarget
          ? '0 0 0 1px rgba(212,175,55,0.14), inset 0 3px 0 #D4AF37'
          : isSelected
            ? '0 0 0 1px rgba(212,175,55,0.12)'
            : 'none',
        overflow: 'hidden',
      }}
    >
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          padding: '12px 16px',
          borderBottom: '1px solid rgba(212,175,55,0.08)',
          background: 'rgba(255,255,255,0.02)',
        }}
      >
        <div>
          <div style={{ color: '#D4AF37', fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
            {getBlockDefinition(block.type)?.label ?? block.type}
          </div>
          <div style={{ color: '#8f846d', fontSize: 13, marginTop: 4 }}>Orden #{block.order + 1}</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              removeBlock(block.id);
            }}
            style={{
              border: '1px solid rgba(255,120,120,0.18)',
              background: 'transparent',
              color: '#ff9e95',
              borderRadius: 999,
              padding: '8px 12px',
              cursor: 'pointer',
            }}
          >
            Eliminar
          </button>
          <button
            type="button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              border: '1px solid rgba(212,175,55,0.12)',
              background: 'rgba(255,255,255,0.02)',
              color: '#FFFFF0',
              borderRadius: 999,
              padding: '8px 12px',
              cursor: 'grab',
            }}
            {...attributes}
            {...listeners}
          >
            <GripVertical size={14} />
            Mover
          </button>
        </div>
      </header>

      <div style={{ padding: 18 }}>
        <div
          style={{
            background: block.props.bgColor ?? preset.bgColor,
            color: block.props.textColor ?? preset.textColor,
            paddingTop: `${block.props.paddingY ?? '0'}px`,
            paddingBottom: `${block.props.paddingY ?? '0'}px`,
            paddingLeft: `${block.props.paddingX ?? '0'}px`,
            paddingRight: `${block.props.paddingX ?? '0'}px`,
            borderRadius: 20,
          }}
        >
          <BuilderBlockPreview block={block} selected={isSelected} />
        </div>
      </div>
    </article>
  );
}

function EmptyCanvasState() {
  return (
    <div
      style={{
        minHeight: 360,
        borderRadius: 28,
        border: '1px dashed rgba(212,175,55,0.24)',
        background: 'rgba(255,255,255,0.02)',
        display: 'grid',
        placeItems: 'center',
        textAlign: 'center',
        padding: 24,
      }}
    >
      <div>
        <div
          style={{
            width: 64,
            height: 64,
            margin: '0 auto 18px',
            borderRadius: 20,
            display: 'grid',
            placeItems: 'center',
            background: 'rgba(212,175,55,0.08)',
            color: '#D4AF37',
          }}
        >
          <LayoutTemplate size={28} />
        </div>
        <h3 style={{ margin: '0 0 8px', color: '#FFFFF0', fontSize: 28 }}>Canvas vacío</h3>
        <p style={{ margin: 0, color: '#BDBDBD', lineHeight: 1.8, maxWidth: 520 }}>
          Arrastra un bloque desde la paleta o insértalo con click. Esta capa ya soporta selección, reorden, edición inline y guardado como JSON estructurado.
        </p>
      </div>
    </div>
  );
}

export default function BuilderCanvas() {
  const layout = usePageBuilderStore((state) => state.document.layout);
  const viewport = usePageBuilderStore((state) => state.viewport);
  const selectedBlockId = usePageBuilderStore((state) => state.selectedBlockId);
  const addBlock = usePageBuilderStore((state) => state.addBlock);
  const reorderBlocks = usePageBuilderStore((state) => state.reorderBlocks);
  const setSelectedBlock = usePageBuilderStore((state) => state.setSelectedBlock);
  const [activePaletteBlockType, setActivePaletteBlockType] = useState<BuilderBlockType | null>(null);
  const [overTargetId, setOverTargetId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const { setNodeRef, isOver } = useDroppable({
    id: 'builder-canvas-dropzone',
    data: {
      source: 'canvas-dropzone',
    },
  });

  const sortableIds = useMemo(() => layout.map((block) => block.id), [layout]);
  const canvasWidth =
    viewport === 'desktop' ? '100%' : viewport === 'tablet' ? '820px' : '420px';
  const viewportLabel =
    viewport === 'desktop' ? 'Desktop' : viewport === 'tablet' ? 'Tablet' : 'Mobile';

  const handleDragStart = (event: DragStartEvent) => {
    const blockType = event.active.data.current?.blockType;
    if (typeof blockType === 'string') {
      setActivePaletteBlockType(blockType as BuilderBlockType);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const source = active.data.current?.source;

    if (source === 'palette' && over) {
      const blockType = active.data.current?.blockType;
      if (typeof blockType === 'string' && (over.id === 'builder-canvas-dropzone' || sortableIds.includes(String(over.id)))) {
        addBlock(blockType as BuilderBlockType);
      }
    }

    if (source === 'canvas' && over && over.id !== active.id) {
      reorderBlocks(String(active.id), String(over.id));
    }

    setActivePaletteBlockType(null);
    setOverTargetId(null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    setOverTargetId(event.over?.id ? String(event.over.id) : null);
  };

  return (
    <section
      style={{
        display: 'grid',
        gap: 16,
        padding: 20,
        borderRadius: 24,
        background: '#111111',
        border: '1px solid rgba(212,175,55,0.14)',
      }}
    >
      <div>
        <div style={{ color: '#D4AF37', fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
          Canvas
        </div>
        <h2 style={{ margin: '10px 0 6px', color: '#FFFFF0', fontSize: 28 }}>Página visual</h2>
        <p style={{ margin: 0, color: '#BDBDBD', lineHeight: 1.7 }}>
          Drop zones visibles, reorden con arrastre, edición inline y preview responsive en tiempo real.
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div
          ref={setNodeRef}
          style={{
            width: canvasWidth,
            maxWidth: '100%',
            margin: '0 auto',
            borderRadius: 28,
            padding: 18,
            border: isOver ? '1px solid rgba(212,175,55,0.38)' : '1px solid rgba(212,175,55,0.08)',
            background:
              viewport === 'desktop'
                ? isOver
                  ? 'linear-gradient(180deg, rgba(212,175,55,0.05), rgba(255,255,255,0.02))'
                  : 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))'
                : 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015))',
            minHeight: 420,
            boxShadow:
              viewport === 'desktop'
                ? 'inset 0 1px 0 rgba(255,255,255,0.04)'
                : '0 24px 60px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.04)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
              marginBottom: 16,
              paddingBottom: 14,
              borderBottom: '1px solid rgba(212,175,55,0.08)',
            }}
          >
            <div style={{ color: '#D4AF37', fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              Vista {viewportLabel}
            </div>
            <div
              style={{
                color: '#8f846d',
                fontSize: 12,
                padding: '6px 10px',
                borderRadius: 999,
                border: '1px solid rgba(212,175,55,0.12)',
                background: 'rgba(255,255,255,0.02)',
              }}
            >
              {layout.length} bloques
            </div>
          </div>

          {layout.length === 0 ? (
            <EmptyCanvasState />
          ) : (
            <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
              <div style={{ display: 'grid', gap: 14 }}>
                {layout.map((block) => (
                  <SortableBlockCard
                    key={block.id}
                    block={block}
                    isSelected={selectedBlockId === block.id}
                    isDropTarget={overTargetId === block.id}
                    onSelect={() => setSelectedBlock(block.id)}
                  />
                ))}
              </div>
            </SortableContext>
          )}
        </div>

        <DragOverlay>
          {activePaletteBlockType ? (
            <div
              style={{
                borderRadius: 20,
                padding: '14px 16px',
                background: 'rgba(20,14,10,0.96)',
                border: '1px solid rgba(212,175,55,0.22)',
                color: '#FFFFF0',
                minWidth: 220,
              }}
            >
              {getBlockDefinition(activePaletteBlockType)?.label ?? activePaletteBlockType}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </section>
  );
}
