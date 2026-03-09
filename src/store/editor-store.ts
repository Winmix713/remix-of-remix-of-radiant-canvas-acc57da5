import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type {
  DemoDocument,
  EditorDocument,
  EditorNode,
  EditorStoreActions,
  EditorStoreState,
  FramePreset,
  HistorySnapshot,
  NodeStyle,
  NodeType,
  SavedPreset,
  UIState,
  ViewportState,
} from "./types";
import {
  getBuiltInPresetDocuments,
  getDemoDocuments,
} from "@/editor/adapters/glow-compat";

const MAX_HISTORY = 50;
const FRAME_DIMENSIONS: Record<FramePreset, { width: number; height: number }> = {
  mobile: { width: 320, height: 400 },
  tablet: { width: 500, height: 620 },
  desktop: { width: 820, height: 520 },
};

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));
const generateId = () => `node-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const demoDocuments = getDemoDocuments();
const builtInPresets = getBuiltInPresetDocuments();
const initialDocument = clone(demoDocuments[0].document);

const initialUI: UIState = {
  selectedNodeId: Object.values(initialDocument.nodes).find((node) => node.type === "effect-layer")?.id ?? null,
  selectedNodeIds: [],
  hoveredNodeId: null,
  activeInspectorTab: "style",
  showExportModal: false,
  showCommandPalette: false,
  showABSplit: false,
  cssOverride: null,
  showGrid: initialDocument.settings.gridVisible,
  showDimensions: initialDocument.settings.dimensionsVisible,
  showRulers: initialDocument.settings.rulersVisible,
};

const initialViewport: ViewportState = {
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
  framePreset: "mobile",
  frameWidth: FRAME_DIMENSIONS.mobile.width,
  frameHeight: FRAME_DIMENSIONS.mobile.height,
};

const snapshotDocument = (document: EditorDocument, label?: string): HistorySnapshot => ({
  document: clone(document),
  timestamp: Date.now(),
  label,
});

const withMetadata = (document: EditorDocument): EditorDocument => ({
  ...document,
  metadata: {
    ...document.metadata,
    updatedAt: Date.now(),
    version: document.metadata.version + 1,
  },
});

const recordSnapshot = (
  state: EditorStoreState,
  label: string | undefined,
  updater: (draft: EditorStoreState) => Partial<EditorStoreState>
): Partial<EditorStoreState> => {
  const snapshot = snapshotDocument(state.document, label);
  const past = [...state.history.past, snapshot].slice(-MAX_HISTORY);
  return {
    history: {
      past,
      future: [],
    },
    ...updater(state),
  };
};

const getNodeAndChildren = (document: EditorDocument, nodeId: string): string[] => {
  const node = document.nodes[nodeId];
  if (!node) return [];
  return [nodeId, ...node.childIds.flatMap((childId) => getNodeAndChildren(document, childId))];
};

export const useEditorStore = create<EditorStoreState & EditorStoreActions>()(
  devtools(
    persist(
      (set, get) => ({
        document: initialDocument,
        ui: initialUI,
        viewport: initialViewport,
        history: {
          past: [],
          future: [],
        },
        presets: {
          userPresets: {},
          builtInPresets: builtInPresets,
          favorites: [],
        },
        demoDocuments,
        activeDemoDocumentId: demoDocuments[0]?.id ?? null,

        setDocument: (document, options) => {
          const normalizedDocument = withMetadata(clone(document));
          set((state) => {
            const nextSelectedNodeId = state.ui.selectedNodeId && normalizedDocument.nodes[state.ui.selectedNodeId]
              ? state.ui.selectedNodeId
              : Object.values(normalizedDocument.nodes).find((node) => node.type === "effect-layer")?.id ?? null;

            if (options?.recordHistory === false) {
              return {
                document: normalizedDocument,
                ui: {
                  ...state.ui,
                  selectedNodeId: nextSelectedNodeId,
                  selectedNodeIds: nextSelectedNodeId ? [nextSelectedNodeId] : [],
                },
              };
            }

            return recordSnapshot(state, options?.label ?? "Set document", () => ({
              document: normalizedDocument,
              ui: {
                ...state.ui,
                selectedNodeId: nextSelectedNodeId,
                selectedNodeIds: nextSelectedNodeId ? [nextSelectedNodeId] : [],
              },
            }));
          });
        },

        updateDocumentSettings: (updates, options) => {
          set((state) => {
            const apply = () => ({
              document: {
                ...state.document,
                settings: {
                  ...state.document.settings,
                  ...updates,
                },
                metadata: {
                  ...state.document.metadata,
                  updatedAt: Date.now(),
                  version: state.document.metadata.version + 1,
                },
              },
              ui: {
                ...state.ui,
                showGrid: updates.gridVisible ?? state.ui.showGrid,
                showDimensions: updates.dimensionsVisible ?? state.ui.showDimensions,
                showRulers: updates.rulersVisible ?? state.ui.showRulers,
              },
            });

            if (options?.recordHistory === false) {
              return apply();
            }

            return recordSnapshot(state, options?.label ?? "Update settings", apply);
          });
        },

        createNode: (type, parentId, defaults) => {
          const nodeId = generateId();
          set((state) => recordSnapshot(state, `Create ${type}`, () => {
            const now = Date.now();
            const newNode: EditorNode = {
              id: nodeId,
              type,
              name: defaults?.name ?? `${type}-${nodeId.slice(-4)}`,
              parentId,
              childIds: [],
              style: defaults?.style ?? {},
              layout: defaults?.layout,
              props: defaults?.props ?? {},
              animation: defaults?.animation,
              visible: defaults?.visible ?? true,
              locked: defaults?.locked ?? false,
              metadata: {
                createdAt: now,
                updatedAt: now,
              },
            };

            const document = clone(state.document);
            document.nodes[nodeId] = newNode;

            if (parentId && document.nodes[parentId]) {
              document.nodes[parentId] = {
                ...document.nodes[parentId],
                childIds: [...document.nodes[parentId].childIds, nodeId],
              };
            } else {
              document.rootNodeIds = [...document.rootNodeIds, nodeId];
            }

            return {
              document: withMetadata(document),
              ui: {
                ...state.ui,
                selectedNodeId: nodeId,
                selectedNodeIds: [nodeId],
              },
            };
          }));
          return nodeId;
        },

        deleteNode: (nodeId) => {
          set((state) => recordSnapshot(state, "Delete node", () => {
            const document = clone(state.document);
            const node = document.nodes[nodeId];
            if (!node) return {};

            const toDelete = getNodeAndChildren(document, nodeId);
            toDelete.forEach((id) => delete document.nodes[id]);

            if (node.parentId && document.nodes[node.parentId]) {
              document.nodes[node.parentId] = {
                ...document.nodes[node.parentId],
                childIds: document.nodes[node.parentId].childIds.filter((id) => id !== nodeId),
              };
            } else {
              document.rootNodeIds = document.rootNodeIds.filter((id) => id !== nodeId);
            }

            const nextSelection = state.ui.selectedNodeId === nodeId ? null : state.ui.selectedNodeId;

            return {
              document: withMetadata(document),
              ui: {
                ...state.ui,
                selectedNodeId: nextSelection,
                selectedNodeIds: nextSelection ? [nextSelection] : [],
              },
            };
          }));
        },

        updateNode: (nodeId, updates, options) => {
          set((state) => {
            const apply = () => {
              const node = state.document.nodes[nodeId];
              if (!node) return {};
              const document = clone(state.document);
              document.nodes[nodeId] = {
                ...node,
                ...updates,
                metadata: {
                  ...node.metadata,
                  updatedAt: Date.now(),
                },
              };
              return { document: withMetadata(document) };
            };

            if (options?.recordHistory === false) {
              return apply();
            }

            return recordSnapshot(state, options?.label ?? "Update node", apply);
          });
        },

        updateNodeStyle: (nodeId, updates, options) => {
          set((state) => {
            const apply = () => {
              const node = state.document.nodes[nodeId];
              if (!node) return {};
              const document = clone(state.document);
              document.nodes[nodeId] = {
                ...node,
                style: {
                  ...node.style,
                  ...updates,
                },
                metadata: {
                  ...node.metadata,
                  updatedAt: Date.now(),
                },
              };
              return { document: withMetadata(document) };
            };

            if (options?.recordHistory === false) {
              return apply();
            }

            return recordSnapshot(state, options?.label ?? "Update style", apply);
          });
        },

        moveNode: (nodeId, newParentId, index) => {
          set((state) => recordSnapshot(state, "Move node", () => {
            const document = clone(state.document);
            const node = document.nodes[nodeId];
            if (!node) return {};

            if (node.parentId && document.nodes[node.parentId]) {
              document.nodes[node.parentId] = {
                ...document.nodes[node.parentId],
                childIds: document.nodes[node.parentId].childIds.filter((id) => id !== nodeId),
              };
            } else {
              document.rootNodeIds = document.rootNodeIds.filter((id) => id !== nodeId);
            }

            document.nodes[nodeId] = {
              ...node,
              parentId: newParentId,
            };

            if (newParentId && document.nodes[newParentId]) {
              const childIds = [...document.nodes[newParentId].childIds];
              if (index === undefined) childIds.push(nodeId);
              else childIds.splice(index, 0, nodeId);
              document.nodes[newParentId] = {
                ...document.nodes[newParentId],
                childIds,
              };
            } else {
              const rootNodeIds = [...document.rootNodeIds];
              if (index === undefined) rootNodeIds.push(nodeId);
              else rootNodeIds.splice(index, 0, nodeId);
              document.rootNodeIds = rootNodeIds;
            }

            return { document: withMetadata(document) };
          }));
        },

        selectNode: (nodeId, multi) => {
          set((state) => {
            if (!nodeId) {
              return {
                ui: {
                  ...state.ui,
                  selectedNodeId: null,
                  selectedNodeIds: [],
                },
              };
            }

            if (!multi) {
              return {
                ui: {
                  ...state.ui,
                  selectedNodeId: nodeId,
                  selectedNodeIds: [nodeId],
                },
              };
            }

            const selectedNodeIds = state.ui.selectedNodeIds.includes(nodeId)
              ? state.ui.selectedNodeIds.filter((id) => id !== nodeId)
              : [...state.ui.selectedNodeIds, nodeId];

            return {
              ui: {
                ...state.ui,
                selectedNodeId: selectedNodeIds[selectedNodeIds.length - 1] ?? null,
                selectedNodeIds,
              },
            };
          });
        },

        deselectNode: (nodeId) => {
          set((state) => {
            const selectedNodeIds = state.ui.selectedNodeIds.filter((id) => id !== nodeId);
            return {
              ui: {
                ...state.ui,
                selectedNodeId: selectedNodeIds[selectedNodeIds.length - 1] ?? null,
                selectedNodeIds,
              },
            };
          });
        },

        clearSelection: () => {
          set((state) => ({
            ui: {
              ...state.ui,
              selectedNodeId: null,
              selectedNodeIds: [],
            },
          }));
        },

        setActiveInspectorTab: (tab) => {
          set((state) => ({ ui: { ...state.ui, activeInspectorTab: tab } }));
        },

        setShowExportModal: (show) => {
          set((state) => ({ ui: { ...state.ui, showExportModal: show } }));
        },

        setShowCommandPalette: (show) => {
          set((state) => ({ ui: { ...state.ui, showCommandPalette: show } }));
        },

        setShowABSplit: (show) => {
          set((state) => ({ ui: { ...state.ui, showABSplit: show } }));
        },

        setCssOverride: (css) => {
          set((state) => ({ ui: { ...state.ui, cssOverride: css } }));
        },

        setViewportFlags: (updates) => {
          set((state) => ({
            ui: {
              ...state.ui,
              ...updates,
            },
          }));
        },

        setZoom: (zoom) => {
          set((state) => ({
            viewport: {
              ...state.viewport,
              zoom: Math.max(0.25, Math.min(3, zoom)),
            },
          }));
        },

        panViewport: (dx, dy) => {
          set((state) => ({
            viewport: {
              ...state.viewport,
              offsetX: state.viewport.offsetX + dx,
              offsetY: state.viewport.offsetY + dy,
            },
          }));
        },

        setFramePreset: (preset) => {
          set((state) => ({
            viewport: {
              ...state.viewport,
              framePreset: preset,
              frameWidth: FRAME_DIMENSIONS[preset].width,
              frameHeight: FRAME_DIMENSIONS[preset].height,
            },
          }));
        },

        savePreset: (name, description) => {
          const presetId = generateId();
          const preset: SavedPreset = {
            id: presetId,
            name,
            description,
            timestamp: Date.now(),
            favorite: false,
            document: clone(get().document),
          };

          set((state) => ({
            presets: {
              ...state.presets,
              userPresets: {
                ...state.presets.userPresets,
                [presetId]: preset,
              },
            },
          }));
        },

        loadPreset: (presetId) => {
          const preset = get().presets.userPresets[presetId] ?? get().presets.builtInPresets[presetId];
          if (!preset) return;
          get().setDocument(preset.document, { label: `Load preset ${preset.name}` });
        },

        deletePreset: (presetId) => {
          set((state) => {
            const userPresets = { ...state.presets.userPresets };
            delete userPresets[presetId];
            return {
              presets: {
                ...state.presets,
                userPresets,
                favorites: state.presets.favorites.filter((id) => id !== presetId),
              },
            };
          });
        },

        toggleFavorite: (presetId) => {
          set((state) => ({
            presets: {
              ...state.presets,
              favorites: state.presets.favorites.includes(presetId)
                ? state.presets.favorites.filter((id) => id !== presetId)
                : [...state.presets.favorites, presetId],
            },
          }));
        },

        loadDemoDocument: (demoId) => {
          const demo = get().demoDocuments.find((entry) => entry.id === demoId);
          if (!demo) return;
          get().setDocument(demo.document, { label: `Load demo ${demo.name}` });
          set({ activeDemoDocumentId: demoId, ui: { ...get().ui, cssOverride: null } });
        },

        undo: () => {
          set((state) => {
            if (state.history.past.length === 0) return state;
            const previous = state.history.past[state.history.past.length - 1];
            const current = snapshotDocument(state.document, "Undo checkpoint");
            return {
              document: clone(previous.document),
              history: {
                past: state.history.past.slice(0, -1),
                future: [current, ...state.history.future],
              },
            };
          });
        },

        redo: () => {
          set((state) => {
            if (state.history.future.length === 0) return state;
            const next = state.history.future[0];
            const current = snapshotDocument(state.document, "Redo checkpoint");
            return {
              document: clone(next.document),
              history: {
                past: [...state.history.past, current].slice(-MAX_HISTORY),
                future: state.history.future.slice(1),
              },
            };
          });
        },

        pushHistory: (label) => {
          set((state) => ({
            history: {
              past: [...state.history.past, snapshotDocument(state.document, label)].slice(-MAX_HISTORY),
              future: [],
            },
          }));
        },

        canUndo: () => get().history.past.length > 0,
        canRedo: () => get().history.future.length > 0,
      }),
      {
        name: "canvas-studio-storage",
        partialize: (state) => ({
          document: state.document,
          presets: state.presets,
          demoDocuments: state.demoDocuments,
          activeDemoDocumentId: state.activeDemoDocumentId,
        }),
      }
    )
  )
);

export const selectSelectedNode = (state: EditorStoreState) =>
  state.ui.selectedNodeId ? state.document.nodes[state.ui.selectedNodeId] : undefined;

export const selectCanUndo = (state: EditorStoreState) => state.history.past.length > 0;
export const selectCanRedo = (state: EditorStoreState) => state.history.future.length > 0;
