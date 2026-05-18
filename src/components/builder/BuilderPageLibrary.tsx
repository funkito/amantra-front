'use client';

import { useEffect, useState } from 'react';
import { CopyPlus, FilePlus2, LibraryBig } from 'lucide-react';
import { createBuilderPage, fetchBuilderPageLibrary } from '@/lib/builder/api';
import type { BuilderPageLibraryItem } from '@/lib/builder/types';

interface BuilderPageLibraryProps {
  currentSlug: string;
}

export default function BuilderPageLibrary({ currentSlug }: BuilderPageLibraryProps) {
  const [pages, setPages] = useState<BuilderPageLibraryItem[]>([]);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void fetchBuilderPageLibrary()
      .then((items) => {
        if (!cancelled) {
          setPages(items);
        }
      })
      .catch((fetchError) => {
        if (!cancelled) {
          setError(fetchError instanceof Error ? fetchError.message : 'No fue posible cargar páginas.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [currentSlug]);

  const submit = async (mode: 'blank' | 'duplicate') => {
    try {
      setIsSubmitting(true);
      setError(null);
      const result = await createBuilderPage({
        mode,
        slug,
        title,
        sourceSlug: mode === 'duplicate' ? currentSlug : undefined,
      });

      if (typeof window !== 'undefined' && result.slug) {
        window.location.href = `/admin_group/admin/builder?slug=${encodeURIComponent(result.slug)}`;
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No fue posible crear la página.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      style={{
        display: 'grid',
        gap: 12,
        padding: 16,
        borderRadius: 20,
        border: '1px solid rgba(212,175,55,0.14)',
        background: 'rgba(255,255,255,0.02)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#D4AF37', fontWeight: 700 }}>
        <LibraryBig size={16} />
        Biblioteca de páginas
      </div>

      <div style={{ display: 'grid', gap: 8, maxHeight: 180, overflow: 'auto' }}>
        {pages.map((page) => {
          const active = page.slug === currentSlug;

          return (
            <a
              key={page.id}
              href={`/admin_group/admin/builder?slug=${encodeURIComponent(page.slug)}`}
              style={{
                display: 'grid',
                gap: 4,
                padding: '10px 12px',
                borderRadius: 14,
                textDecoration: 'none',
                border: active ? '1px solid #D4AF37' : '1px solid rgba(212,175,55,0.12)',
                background: active ? 'rgba(212,175,55,0.08)' : 'rgba(255,255,255,0.02)',
                color: '#FFFFF0',
              }}
            >
              <div style={{ fontWeight: 700 }}>{page.title}</div>
              <div style={{ color: '#8f846d', fontSize: 12 }}>
                /{page.slug} · {page.status}
              </div>
            </a>
          );
        })}
      </div>

      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Título nueva página"
        style={fieldStyle}
      />
      <input
        value={slug}
        onChange={(event) => setSlug(event.target.value.toLowerCase().trim())}
        placeholder="slug-nueva-pagina"
        style={fieldStyle}
      />

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button type="button" onClick={() => void submit('blank')} disabled={isSubmitting || !title || !slug} style={buttonStyle}>
          <FilePlus2 size={14} />
          Nueva
        </button>
        <button type="button" onClick={() => void submit('duplicate')} disabled={isSubmitting || !title || !slug} style={buttonStyle}>
          <CopyPlus size={14} />
          Duplicar actual
        </button>
      </div>

      {error ? <div style={{ color: '#ff9e95', lineHeight: 1.6 }}>{error}</div> : null}
    </section>
  );
}

const fieldStyle: React.CSSProperties = {
  border: '1px solid rgba(212,175,55,0.12)',
  background: 'rgba(255,255,255,0.02)',
  color: '#FFFFF0',
  borderRadius: 14,
  padding: '10px 12px',
  outline: 'none',
};

const buttonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '10px 12px',
  borderRadius: 999,
  border: '1px solid rgba(212,175,55,0.12)',
  background: 'rgba(255,255,255,0.02)',
  color: '#FFFFF0',
  cursor: 'pointer',
  fontWeight: 700,
};
