'use client';

import { useEffect } from 'react';
import BuilderCanvas from '@/components/builder/BuilderCanvas';
import BuilderHeader from '@/components/builder/BuilderHeader';
import BuilderInspector from '@/components/builder/BuilderInspector';
import BuilderSidebar from '@/components/builder/BuilderSidebar';
import { clearBuilderFallback, fetchBuilderDocument, persistBuilderFallback, readBuilderFallback, saveBuilderDraft } from '@/lib/builder/api';
import { usePageBuilderStore } from '@/lib/store/usePageBuilderStore';

interface BuilderWorkspaceProps {
  slug?: string;
}

export default function BuilderWorkspace({ slug = 'inicio' }: BuilderWorkspaceProps) {
  const replaceDocument = usePageBuilderStore((state) => state.replaceDocument);
  const setSavingState = usePageBuilderStore((state) => state.setSavingState);
  const isHydratedFromApi = usePageBuilderStore((state) => state.isHydratedFromApi);
  const document = usePageBuilderStore((state) => state.document);
  const isDirty = usePageBuilderStore((state) => state.isDirty);
  const isSaving = usePageBuilderStore((state) => state.isSaving);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const remoteDocument = await fetchBuilderDocument(slug);
        if (cancelled) {
          return;
        }

        if (remoteDocument) {
          replaceDocument(remoteDocument, { markClean: true });
          return;
        }

        const fallbackDocument = readBuilderFallback(slug);
        if (fallbackDocument) {
          replaceDocument(fallbackDocument, { markClean: false });
        }
      } catch (error) {
        const fallbackDocument = readBuilderFallback(slug);
        if (fallbackDocument && !cancelled) {
          replaceDocument(fallbackDocument, { markClean: false });
        }

        if (!cancelled) {
          setSavingState({
            isSaving: false,
            saveError: error instanceof Error ? error.message : 'No fue posible cargar la página.',
          });
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [replaceDocument, setSavingState, slug]);

  useEffect(() => {
    if (!isHydratedFromApi || !isDirty) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      persistBuilderFallback(document);

      if (document.status !== 'draft' || isSaving) {
        return;
      }

      void saveBuilderDraft(document)
        .then(() => {
          clearBuilderFallback(document.slug);
          setSavingState({ isSaving: false, saveError: null, isDirty: false });
        })
        .catch((error) => {
          setSavingState({
            isSaving: false,
            saveError: error instanceof Error ? error.message : 'No fue posible ejecutar el autosave.',
          });
        });
    }, 1500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [document, isDirty, isHydratedFromApi, isSaving, setSavingState]);

  return (
    <div
      style={{
        display: 'grid',
        gap: 24,
        background: document.theme.pageBg,
        color: document.theme.textColor,
        padding: 18,
        borderRadius: 28,
      }}
    >
      <BuilderHeader />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '300px minmax(0, 1fr) 300px',
          gap: 20,
          alignItems: 'start',
        }}
      >
        <BuilderSidebar />
        <BuilderCanvas />
        <BuilderInspector />
      </div>
    </div>
  );
}
