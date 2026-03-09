/**
 * Editor Platform - Zustand Store
 * Centralized state management with normalized document model
 */

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import {
  EditorDocument,
  EditorNode,
  EditorStoreState,
  EditorStoreActions,
  NodeType,
  HistorySnapshot,
  SavedPreset,
  CanvasBackground,
} from "./types";

// Helper: Generate unique ID
const generateId = () => `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Default values
const DEFAULT_CANVAS_BACKGROUND: CanvasBackground = "dark";
const MAX_HISTORY = 50;

// ============================================================================
// STORE CREATION
// ============================================================================

export const useEditorStore = create<EditorStoreState & EditorStoreActions>()(
  devtools(
    persist(
      (set, get) => {
        // Helper functions
        const getNode = (nodeId: string): EditorNode | undefined => {
          return get().document.nodes[nodeId];
        };

        const getSelectedNode = (): EditorNode | undefined => {
          const { ui, document } = get();
          if (!ui.selectedNodeId) return undefined;
          return document.nodes[ui.selectedNodeId];
        };

        const getNodeAndChildren = (nodeId: string): string[] => {
          const node = getNode(nodeId);
          if (!node) return [];
          const result = [nodeId];
          node.childIds.forEach((childId) => {
            result.push(...getNodeAndChildren(childId));
          });
          return result;
        };

        const pushHistory = () => {
          set((state) => {
            const snapshot: HistorySnapshot = {
              document: JSON.parse(JSON.stringify(state.document)),
              timestamp: Date.now(),
            };
            const newPast = [...state.history.past, snapshot];
            if (newPast.length > MAX_HISTORY) {
              newPast.shift();
            }
            return {
              history: {
                past: newPast,
                future: [],
              },
            };
          });
        };

        return {
          // ===== INITIAL STATE =====
          document: {
            id: generateId(),
            name: "Untitled Document",
            nodes: {
              "root-canvas": {
                id: "root-canvas",
                type: "group",
                name: "Canvas",
                parentId: null,
                childIds: [],
                style: {},
                visible: true,
                locked: false,
                props: {},
              },
            },
            rootNodeIds: ["root-canvas"],
            settings: {
              canvasBackground: DEFAULT_CANVAS_BACKGROUND,
              gridVisible: true,
              dimensionsVisible: true,
              rulersVisible: true,
              globalScale: 1,
              globalOpacity: 1,
              noiseEnabled: false,
              noiseIntensity: 0.5,
            },
            metadata: {
              createdAt: Date.now(),
              updatedAt: Date.now(),
              version: 1,
            },
          },

          ui: {
            selectedNodeId: null,
            selectedNodeIds: [],
            hoveredNodeId: null,
            activeInspectorTab: "style",
            showExportModal: false,
            showCommandPalette: false,
            showABSplit: false,
          },

          viewport: {
            zoom: 1,
            offsetX: 0,
            offsetY: 0,
            frameWidth: 1200,
            frameHeight: 800,
          },

          history: {
            past: [],
            future: [],
          },

          presets: {
            userPresets: {},
            builtInPresets: {},
            favorites: [],
          },

          // ===== DOCUMENT ACTIONS =====
          createNode: (type: NodeType, parentId: string | null, defaults?: Partial<EditorNode>) => {
            const nodeId = generateId();
            const newNode: EditorNode = {
              id: nodeId,
              type,
              name: `${type}-${nodeId.substring(0, 8)}`,
              parentId,
              childIds: [],
              style: defaults?.style || {},
              layout: defaults?.layout,
              props: defaults?.props || {},
              visible: true,
              locked: false,
              animation: defaults?.animation,
              metadata: {
                createdAt: Date.now(),
                updatedAt: Date.now(),
              },
            };

            set((state) => {
              const newDocument = { ...state.document };
              newDocument.nodes[nodeId] = newNode;

              if (parentId && newDocument.nodes[parentId]) {
                newDocument.nodes[parentId].childIds.push(nodeId);
              } else if (!parentId) {
                newDocument.rootNodeIds.push(nodeId);
              }

              newDocument.metadata.updatedAt = Date.now();
              return { document: newDocument };
            });

            pushHistory();
            return nodeId;
          },

          deleteNode: (nodeId: string) => {
            set((state) => {
              const node = state.document.nodes[nodeId];
              if (!node) return state;

              const newDocument = { ...state.document };
              const newNodes = { ...newDocument.nodes };

              // Delete node and all descendants
              const toDelete = getNodeAndChildren(nodeId);
              toDelete.forEach((id) => {
                delete newNodes[id];
              });

              // Update parent
              if (node.parentId) {
                const parent = newNodes[node.parentId];
                if (parent) {
                  parent.childIds = parent.childIds.filter((id) => id !== nodeId);
                }
              } else {
                newDocument.rootNodeIds = newDocument.rootNodeIds.filter((id) => id !== nodeId);
              }

              // Clear selection if deleted node was selected
              let newUI = state.ui;
              if (state.ui.selectedNodeId === nodeId) {
                newUI = { ...state.ui, selectedNodeId: null };
              }

              newDocument.nodes = newNodes;
              newDocument.metadata.updatedAt = Date.now();
              return { document: newDocument, ui: newUI };
            });

            pushHistory();
          },

          updateNode: (nodeId: string, updates: Partial<EditorNode>) => {
            set((state) => {
              const node = state.document.nodes[nodeId];
              if (!node) return state;

              const newDocument = { ...state.document };
              const newNodes = { ...newDocument.nodes };
              newNodes[nodeId] = { ...node, ...updates };
              newDocument.nodes = newNodes;
              newDocument.metadata.updatedAt = Date.now();
              return { document: newDocument };
            });

            // Don't push history on every update; let caller decide (see PropertyPanel usage)
          },

          moveNode: (nodeId: string, newParentId: string | null, index?: number) => {
            set((state) => {
              const node = state.document.nodes[nodeId];
              if (!node) return state;

              const newDocument = { ...state.document };
              const newNodes = { ...newDocument.nodes };

              // Remove from old parent
              if (node.parentId) {
                const oldParent = newNodes[node.parentId];
                if (oldParent) {
                  oldParent.childIds = oldParent.childIds.filter((id) => id !== nodeId);
                }
              } else {
                newDocument.rootNodeIds = newDocument.rootNodeIds.filter((id) => id !== nodeId);
              }

              // Add to new parent
              node.parentId = newParentId;
              if (newParentId) {
                const newParent = newNodes[newParentId];
                if (newParent) {
                  if (index !== undefined) {
                    newParent.childIds.splice(index, 0, nodeId);
                  } else {
                    newParent.childIds.push(nodeId);
                  }
                }
              } else {
                if (index !== undefined) {
                  newDocument.rootNodeIds.splice(index, 0, nodeId);
                } else {
                  newDocument.rootNodeIds.push(nodeId);
                }
              }

              newDocument.nodes = newNodes;
              newDocument.metadata.updatedAt = Date.now();
              return { document: newDocument };
            });

            pushHistory();
          },

          // ===== SELECTION ACTIONS =====
          selectNode: (nodeId: string, multi?: boolean) => {
            set((state) => {
              if (!multi) {
                return {
                  ui: {
                    ...state.ui,
                    selectedNodeId: nodeId,
                    selectedNodeIds: [nodeId],
                  },
                };
              } else {
                const newIds = state.ui.selectedNodeIds.includes(nodeId)
                  ? state.ui.selectedNodeIds.filter((id) => id !== nodeId)
                  : [...state.ui.selectedNodeIds, nodeId];
                return {
                  ui: {
                    ...state.ui,
                    selectedNodeIds: newIds,
                    selectedNodeId: newIds[newIds.length - 1] || null,
                  },
                };
              }
            });
          },

          deselectNode: (nodeId: string) => {
            set((state) => {
              const newIds = state.ui.selectedNodeIds.filter((id) => id !== nodeId);
              return {
                ui: {
                  ...state.ui,
                  selectedNodeIds: newIds,
                  selectedNodeId: newIds.length > 0 ? newIds[newIds.length - 1] : null,
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

          // ===== UI ACTIONS =====
          setActiveInspectorTab: (tab: "style" | "global" | "code") => {
            set((state) => ({
              ui: { ...state.ui, activeInspectorTab: tab },
            }));
          },

          toggleExportModal: () => {
            set((state) => ({
              ui: { ...state.ui, showExportModal: !state.ui.showExportModal },
            }));
          },

          toggleCommandPalette: () => {
            set((state) => ({
              ui: { ...state.ui, showCommandPalette: !state.ui.showCommandPalette },
            }));
          },

          toggleABSplit: () => {
            set((state) => ({
              ui: { ...state.ui, showABSplit: !state.ui.showABSplit },
            }));
          },

          // ===== VIEWPORT ACTIONS =====
          setZoom: (zoom: number) => {
            set((state) => ({
              viewport: { ...state.viewport, zoom: Math.max(0.1, Math.min(5, zoom)) },
            }));
          },

          panViewport: (dx: number, dy: number) => {
            set((state) => ({
              viewport: {
                ...state.viewport,
                offsetX: state.viewport.offsetX + dx,
                offsetY: state.viewport.offsetY + dy,
              },
            }));
          },

          // ===== PRESET ACTIONS =====
          savePreset: (name: string, description?: string) => {
            const presetId = generateId();
            const preset: SavedPreset = {
              id: presetId,
              name,
              description,
              timestamp: Date.now(),
              favorite: false,
              document: get().document,
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

          loadPreset: (presetId: string) => {
            const { userPresets, builtInPresets } = get().presets;
            const preset = userPresets[presetId] || builtInPresets[presetId];

            if (preset) {
              set(() => ({
                document: JSON.parse(JSON.stringify(preset.document)),
              }));
              pushHistory();
            }
          },

          deletePreset: (presetId: string) => {
            set((state) => {
              const newUserPresets = { ...state.presets.userPresets };
              delete newUserPresets[presetId];
              return {
                presets: {
                  ...state.presets,
                  userPresets: newUserPresets,
                  favorites: state.presets.favorites.filter((id) => id !== presetId),
                },
              };
            });
          },

          toggleFavorite: (presetId: string) => {
            set((state) => {
              const isFavorite = state.presets.favorites.includes(presetId);
              return {
                presets: {
                  ...state.presets,
                  favorites: isFavorite
                    ? state.presets.favorites.filter((id) => id !== presetId)
                    : [...state.presets.favorites, presetId],
                },
              };
            });
          },

          // ===== HISTORY ACTIONS =====
          undo: () => {
            set((state) => {
              if (state.history.past.length === 0) return state;
              const previousSnapshot = state.history.past[state.history.past.length - 1];
              const currentSnapshot: HistorySnapshot = {
                document: state.document,
                timestamp: Date.now(),
              };

              return {
                document: previousSnapshot.document,
                history: {
                  past: state.history.past.slice(0, -1),
                  future: [currentSnapshot, ...state.history.future],
                },
              };
            });
          },

          redo: () => {
            set((state) => {
              if (state.history.future.length === 0) return state;
              const nextSnapshot = state.history.future[0];
              const currentSnapshot: HistorySnapshot = {
                document: state.document,
                timestamp: Date.now(),
              };

              return {
                document: nextSnapshot.document,
                history: {
                  past: [...state.history.past, currentSnapshot],
                  future: state.history.future.slice(1),
                },
              };
            });
          },

          pushHistory: () => {
            pushHistory();
          },
        };
      },
      {
        name: "editor-storage",
        partialize: (state) => ({
          document: state.document,
          presets: state.presets,
        }),
      }
    )
  )
);

// ============================================================================
// SELECTORS (for performance optimization)
// ============================================================================

export const selectSelectedNode = (state: EditorStoreState) =>
  state.ui.selectedNodeId ? state.document.nodes[state.ui.selectedNodeId] : undefined;

export const selectNodeChildren = (nodeId: string) => (state: EditorStoreState) =>
  state.document.nodes[nodeId]?.childIds.map((id) => state.document.nodes[id]) || [];

export const selectCanUndo = (state: EditorStoreState) => state.history.past.length > 0;

export const selectCanRedo = (state: EditorStoreState) => state.history.future.length > 0;
