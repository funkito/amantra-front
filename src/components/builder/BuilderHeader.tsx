'use client';

import { AlertTriangle, BookmarkPlus, Eye, Redo2, Save, Send, Undo2 } from 'lucide-react';
import { persistBuilderFallback, saveBuilderDraft } from '@/lib/builder/api';
import { usePageBuilderStore } from '@/lib/store/usePageBuilderStore';

export default function BuilderHeader() {
  const document = usePageBuilderStore((state) => state.document);
  const isDirty = usePageBuilderStore((state) => state.isDirty);
  const isSaving = usePageBuilderStore((state) => state.isSaving);
  const saveError = usePageBuilderStore((state) => state.saveError);
  const resetDocument = usePageBuilderStore((state) => state.resetDocument);
  const setDocumentMeta = usePageBuilderStore((state) => state.setDocumentMeta);
  const setSavingState = usePageBuilderStore((state) => state.setSavingState);
  const history = usePageBuilderStore((state) => state.history);
  const future = usePageBuilderStore((state) => state.future);
  const undo = usePageBuilderStore((state) => state.undo);
  const redo = usePageBuilderStore((state) => state.redo);
  const createVersion = usePageBuilderStore((state) => state.createVersion);

  const handleSave = async (status: 'draft' | 'published') => {
    try {
      setSavingState({ isSaving: true, saveError: null });
      const nextDocument = { ...document, status };
      setDocumentMeta({ status });
      createVersion(status === 'published' ? 'Versión publicada' : 'Versión de borrador', status);
      await saveBuilderDraft(nextDocument);
      setSavingState({ isSaving: false, saveError: null, isDirty: false });
    } catch (error) {
      persistBuilderFallback({ ...document, status });
      setSavingState({
        isSaving: false,
        saveError:
          error instanceof Error
            ? `${error.message} Guardamos una copia local en tu navegador.`
            : 'No fue posible guardar. Se dejó copia local.',
      });
    }
  };

  const handlePreview = async () => {
    try {
      setSavingState({ isSaving: true, saveError: null });
      const previewStatus: 'draft' | 'published' = document.status === 'published' ? 'published' : 'draft';
      const previewDocument = { ...document, status: previewStatus };
      await saveBuilderDraft(previewDocument);
      setSavingState({ isSaving: false, saveError: null, isDirty: false });

      if (typeof window !== 'undefined') {
        window.open(`/admin_group/admin/builder/preview/${previewDocument.slug}`, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      persistBuilderFallback(document);
      setSavingState({
        isSaving: false,
        saveError:
          error instanceof Error
            ? `${error.message} No pudimos abrir la vista previa porque la página no quedó guardada en servidor.`
            : 'No fue posible preparar la vista previa.',
      });
    }
  };

  return (
    <section
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 16,
        flexWrap: 'wrap',
        padding: 20,
        borderRadius: 24,
        background: '#111111',
        border: '1px solid rgba(212,175,55,0.14)',
      }}
    >
      <div>
        <div style={{ color: '#D4AF37', fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
          Builder Layer 6
        </div>
        <div style={{ display: 'grid', gap: 10, maxWidth: 520 }}>
          <input
            value={document.title}
            onChange={(event) => setDocumentMeta({ title: event.target.value })}
            style={{
              border: '1px solid rgba(212,175,55,0.12)',
              background: 'rgba(255,255,255,0.02)',
              color: '#FFFFF0',
              borderRadius: 16,
              padding: '12px 14px',
              fontSize: 26,
              fontWeight: 700,
              outline: 'none',
            }}
          />
          <input
            value={document.slug}
            onChange={(event) => setDocumentMeta({ slug: event.target.value.toLowerCase().trim() })}
            style={{
              border: '1px solid rgba(212,175,55,0.12)',
              background: 'rgba(255,255,255,0.02)',
              color: '#BDBDBD',
              borderRadius: 16,
              padding: '10px 14px',
              outline: 'none',
            }}
          />
        </div>
        <p style={{ margin: 0, color: '#BDBDBD', lineHeight: 1.7 }}>
          JSON-only, canvas editable y base conectada para draft, publicación y render dinámico público.
        </p>
        {saveError ? <p style={{ margin: '10px 0 0', color: '#ff9e95', lineHeight: 1.6 }}>{saveError}</p> : null}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 12px',
            borderRadius: 999,
            border: '1px solid rgba(212,175,55,0.12)',
            background: 'rgba(255,255,255,0.02)',
            color: '#D7D0C3',
          }}
        >
          <AlertTriangle size={14} />
          {isDirty ? 'Cambios locales sin publicar' : 'Sin cambios pendientes'}
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 12px',
            borderRadius: 999,
            border: '1px solid rgba(212,175,55,0.12)',
            background: 'rgba(255,255,255,0.02)',
            color: '#D7D0C3',
          }}
        >
          <BookmarkPlus size={14} />
          {document.versions.length} snapshots
        </div>

        <button
          type="button"
          onClick={undo}
          disabled={history.length === 0}
          style={secondaryActionButtonStyle(history.length === 0)}
        >
          <Undo2 size={14} />
          Undo
        </button>

        <button
          type="button"
          onClick={redo}
          disabled={future.length === 0}
          style={secondaryActionButtonStyle(future.length === 0)}
        >
          <Redo2 size={14} />
          Redo
        </button>

        <button
          type="button"
          onClick={() => void handlePreview()}
          disabled={isSaving}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 14px',
            borderRadius: 999,
            border: '1px solid rgba(212,175,55,0.12)',
            background: 'rgba(255,255,255,0.02)',
            color: '#FFFFF0',
            cursor: isSaving ? 'wait' : 'pointer',
          }}
        >
          <Eye size={14} />
          Preview
        </button>

        <button
          type="button"
          disabled={isSaving}
          onClick={() => void handleSave('draft')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 14px',
            borderRadius: 999,
            border: '1px solid rgba(212,175,55,0.12)',
            background: 'rgba(255,255,255,0.02)',
            color: '#FFFFF0',
            cursor: isSaving ? 'wait' : 'pointer',
          }}
        >
          <Save size={14} />
          {isSaving && document.status === 'draft' ? 'Guardando...' : 'Guardar borrador'}
        </button>

        <button
          type="button"
          disabled={isSaving}
          onClick={() => void handleSave('published')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 14px',
            borderRadius: 999,
            border: 0,
            background: 'linear-gradient(135deg, #f2c86b 0%, #c9922b 100%)',
            color: '#140e0a',
            cursor: isSaving ? 'wait' : 'pointer',
            fontWeight: 700,
          }}
        >
          <Send size={14} />
          {isSaving && document.status === 'published' ? 'Publicando...' : 'Publicar'}
        </button>

        <button
          type="button"
          onClick={resetDocument}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 14px',
            borderRadius: 999,
            border: '1px solid rgba(255,120,120,0.18)',
            background: 'transparent',
            color: '#ff9e95',
            cursor: 'pointer',
          }}
        >
          Reset
        </button>
      </div>
    </section>
  );
}

function secondaryActionButtonStyle(disabled: boolean): React.CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 14px',
    borderRadius: 999,
    border: '1px solid rgba(212,175,55,0.12)',
    background: 'rgba(255,255,255,0.02)',
    color: disabled ? '#766e61' : '#FFFFF0',
    cursor: disabled ? 'not-allowed' : 'pointer',
  };
}
