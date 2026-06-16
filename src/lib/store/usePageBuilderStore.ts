'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { arrayMove } from '@dnd-kit/sortable';
import { builderBlockLibrary, builderSectionTemplates, getBlockDefinition } from '@/lib/builder/block-library';
import type {
  BuilderBlockNode,
  BuilderTemplateDefinition,
  BuilderBlockType,
  BuilderPageTheme,
  BuilderViewport,
  PageBuilderDocument,
  PageStatus,
} from '@/lib/builder/types';

const MAX_HISTORY = 30;

function createBuilderId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function createInitialTheme(): BuilderPageTheme {
  return {
    pageBg: '#140f0c',
    surfaceBg: '#111111',
    textColor: '#f5efe4',
    accentColor: '#d4af37',
  };
}

function createVersionSnapshot(label: string, status: PageStatus) {
  return {
    id: createBuilderId('version'),
    createdAt: new Date().toISOString(),
    label,
    status,
  };
}

function createVersionPayload(document: PageBuilderDocument, statusOverride?: PageStatus) {
  return {
    ...cloneDocument(document),
    status: statusOverride ?? document.status,
  };
}

function cloneDocument(document: PageBuilderDocument): PageBuilderDocument {
  if (typeof structuredClone === 'function') {
    return structuredClone(document);
  }

  return JSON.parse(JSON.stringify(document)) as PageBuilderDocument;
}

function buildNode(type: BuilderBlockType, order: number): BuilderBlockNode {
  const definition = getBlockDefinition(type);

  if (!definition) {
    throw new Error(`No existe definición para el bloque "${type}".`);
  }

  return {
    id: createBuilderId(type),
    order,
    type,
    props: definition.defaultNode.props,
    content: definition.defaultNode.content,
  };
}

function buildTemplateNodes(template: BuilderTemplateDefinition, startOrder: number) {
  return template.blocks.map((seed, index) => {
    const baseNode = buildNode(seed.type, startOrder + index);

    return {
      ...baseNode,
      props: {
        ...baseNode.props,
        ...seed.props,
      },
      content: {
        ...baseNode.content,
        ...seed.content,
      },
    };
  });
}

function commitDocumentChange(
  state: PageBuilderState,
  nextDocument: PageBuilderDocument,
  extras: Partial<PageBuilderState> = {}
) {
  return {
    document: nextDocument,
    history: [...state.history.slice(-(MAX_HISTORY - 1)), cloneDocument(state.document)],
    future: [],
    isDirty: true,
    saveError: null,
    ...extras,
  };
}

function createInitialDocument(): PageBuilderDocument {
  return {
    id: createBuilderId('page'),
    slug: 'inicio',
    title: 'Página de Inicio',
    status: 'draft',
    theme: createInitialTheme(),
    versions: [],
    layout: [],
  };
}

interface PageBuilderState {
  document: PageBuilderDocument;
  viewport: BuilderViewport;
  selectedBlockId: string | null;
  isDirty: boolean;
  isHydratedFromApi: boolean;
  isSaving: boolean;
  saveError: string | null;
  history: PageBuilderDocument[];
  future: PageBuilderDocument[];
  versionPayloads: Record<string, PageBuilderDocument>;
  setViewport: (viewport: BuilderViewport) => void;
  setSelectedBlock: (blockId: string | null) => void;
  setDocumentMeta: (payload: Partial<Pick<PageBuilderDocument, 'title' | 'slug' | 'status'>>) => void;
  updateTheme: (payload: Partial<BuilderPageTheme>) => void;
  updateBlockContent: (blockId: string, payload: Partial<BuilderBlockNode['content']>) => void;
  updateBlockProps: (blockId: string, payload: Partial<BuilderBlockNode['props']>) => void;
  addBlock: (type: BuilderBlockType) => void;
  addTemplate: (templateId: string) => void;
  duplicateBlock: (blockId: string) => void;
  removeBlock: (blockId: string) => void;
  reorderBlocks: (activeId: string, overId: string) => void;
  undo: () => void;
  redo: () => void;
  createVersion: (label?: string, statusOverride?: PageStatus) => string;
  restoreVersion: (versionId: string) => void;
  replaceDocument: (document: PageBuilderDocument, options?: { markClean?: boolean }) => void;
  setSavingState: (payload: { isSaving: boolean; saveError?: string | null; isDirty?: boolean }) => void;
  resetDocument: () => void;
}

export const usePageBuilderStore = create<PageBuilderState>()(
  persist(
    (set) => ({
      document: createInitialDocument(),
      viewport: 'desktop',
      selectedBlockId: null,
      isDirty: false,
      isHydratedFromApi: false,
      isSaving: false,
      saveError: null,
      history: [],
      future: [],
      versionPayloads: {},
      setViewport: (viewport) => set({ viewport }),
      setSelectedBlock: (selectedBlockId) => set({ selectedBlockId }),
      setDocumentMeta: (payload) =>
        set((state) =>
          commitDocumentChange(state, {
            ...state.document,
            ...payload,
          })
        ),
      updateTheme: (payload) =>
        set((state) =>
          commitDocumentChange(state, {
            ...state.document,
            theme: {
              ...state.document.theme,
              ...payload,
            },
          })
        ),
      updateBlockContent: (blockId, payload) =>
        set((state) =>
          commitDocumentChange(state, {
            ...state.document,
            layout: state.document.layout.map((block) =>
              block.id === blockId
                ? {
                    ...block,
                    content: {
                      ...block.content,
                      ...payload,
                    },
                  }
                : block
            ),
          })
        ),
      updateBlockProps: (blockId, payload) =>
        set((state) =>
          commitDocumentChange(state, {
            ...state.document,
            layout: state.document.layout.map((block) =>
              block.id === blockId
                ? {
                    ...block,
                    props: {
                      ...block.props,
                      ...payload,
                    },
                  }
                : block
            ),
          })
        ),
      addBlock: (type) =>
        set((state) => {
          const nextLayout = [...state.document.layout, buildNode(type, state.document.layout.length)];

          return commitDocumentChange(
            state,
            {
              ...state.document,
              layout: nextLayout,
            },
            {
              selectedBlockId: nextLayout.at(-1)?.id ?? null,
            }
          );
        }),
      addTemplate: (templateId) =>
        set((state) => {
          const template = builderSectionTemplates.find((item) => item.id === templateId);

          if (!template) {
            return state;
          }

          const nextBlocks = buildTemplateNodes(template, state.document.layout.length);
          const nextLayout = [...state.document.layout, ...nextBlocks];

          return commitDocumentChange(
            state,
            {
              ...state.document,
              layout: nextLayout,
            },
            {
              selectedBlockId: nextBlocks[0]?.id ?? null,
            }
          );
        }),
      duplicateBlock: (blockId) =>
        set((state) => {
          const sourceBlock = state.document.layout.find((block) => block.id === blockId);

          if (!sourceBlock) {
            return state;
          }

          const duplicate: BuilderBlockNode = {
            ...sourceBlock,
            id: createBuilderId(sourceBlock.type),
            order: sourceBlock.order + 1,
            props: {
              ...sourceBlock.props,
            },
            content: {
              ...sourceBlock.content,
            },
          };

          const insertionIndex = sourceBlock.order + 1;
          const nextLayout = [...state.document.layout];
          nextLayout.splice(insertionIndex, 0, duplicate);

          return commitDocumentChange(
            state,
            {
              ...state.document,
              layout: nextLayout.map((block, index) => ({
                ...block,
                order: index,
              })),
            },
            {
              selectedBlockId: duplicate.id,
            }
          );
        }),
      removeBlock: (blockId) =>
        set((state) => {
          const nextLayout = state.document.layout
            .filter((block) => block.id !== blockId)
            .map((block, index) => ({ ...block, order: index }));

          return commitDocumentChange(
            state,
            {
              ...state.document,
              layout: nextLayout,
            },
            {
              selectedBlockId: state.selectedBlockId === blockId ? nextLayout[0]?.id ?? null : state.selectedBlockId,
            }
          );
        }),
      reorderBlocks: (activeId, overId) =>
        set((state) => {
          const activeIndex = state.document.layout.findIndex((block) => block.id === activeId);
          const overIndex = state.document.layout.findIndex((block) => block.id === overId);

          if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) {
            return state;
          }

          const nextLayout = arrayMove(state.document.layout, activeIndex, overIndex).map((block, index) => ({
            ...block,
            order: index,
          }));

          return commitDocumentChange(state, {
            ...state.document,
            layout: nextLayout,
          });
        }),
      undo: () =>
        set((state) => {
          const previous = state.history.at(-1);

          if (!previous) {
            return state;
          }

          return {
            document: cloneDocument(previous),
            history: state.history.slice(0, -1),
            future: [cloneDocument(state.document), ...state.future].slice(0, MAX_HISTORY),
            selectedBlockId: previous.layout[0]?.id ?? null,
            isDirty: true,
            saveError: null,
          };
        }),
      redo: () =>
        set((state) => {
          const next = state.future[0];

          if (!next) {
            return state;
          }

          return {
            document: cloneDocument(next),
            history: [...state.history.slice(-(MAX_HISTORY - 1)), cloneDocument(state.document)],
            future: state.future.slice(1),
            selectedBlockId: next.layout[0]?.id ?? null,
            isDirty: true,
            saveError: null,
          };
        }),
      createVersion: (label, statusOverride) => {
        const versionId = createBuilderId('version');

        set((state) => ({
          document: {
            ...state.document,
            versions: [
              {
                ...createVersionSnapshot(
                  label?.trim() || `Snapshot ${state.document.versions.length + 1}`,
                  statusOverride ?? state.document.status
                ),
                id: versionId,
              },
              ...state.document.versions,
            ].slice(0, 12),
          },
          versionPayloads: {
            ...state.versionPayloads,
            [versionId]: createVersionPayload(state.document, statusOverride),
          },
          isDirty: true,
          saveError: null,
        }));

        return versionId;
      },
      restoreVersion: (versionId) =>
        set((state) => {
          const snapshot = state.versionPayloads[versionId];

          if (!snapshot) {
            return {
              saveError: 'No encontramos el snapshot local de esa versión.',
            };
          }

          return {
            document: cloneDocument(snapshot),
            selectedBlockId: snapshot.layout[0]?.id ?? null,
            history: [...state.history.slice(-(MAX_HISTORY - 1)), cloneDocument(state.document)],
            future: [],
            isDirty: true,
            saveError: null,
          };
        }),
      replaceDocument: (document, options) =>
        set((state) => ({
          document,
          selectedBlockId: document.layout[0]?.id ?? null,
          isDirty: options?.markClean ? false : true,
          isHydratedFromApi: true,
          saveError: null,
          history: [],
          future: [],
          versionPayloads: document.slug === state.document.slug ? state.versionPayloads : {},
        })),
      setSavingState: ({ isSaving, saveError = null, isDirty }) =>
        set((state) => ({
          isSaving,
          saveError,
          isDirty: typeof isDirty === 'boolean' ? isDirty : state.isDirty,
        })),
      resetDocument: () =>
        set({
          document: createInitialDocument(),
          viewport: 'desktop',
          selectedBlockId: null,
          isDirty: false,
          isHydratedFromApi: false,
          isSaving: false,
          saveError: null,
          history: [],
          future: [],
          versionPayloads: {},
        }),
    }),
    {
      name: 'amantra-page-builder-layer-6',
      partialize: (state) => ({
        document: state.document,
        viewport: state.viewport,
        versionPayloads: state.versionPayloads,
      }),
    }
  )
);

export const availableBuilderBlocks = builderBlockLibrary;
