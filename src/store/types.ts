/**
 * Editor Platform - Core Store Types
 * Normalized state model for multi-type node support.
 */

export type NodeType = "effect-layer" | "group" | "box" | "text" | "button" | "card" | "container" | "image";

export type BlendMode = "normal" | "screen" | "overlay" | "soft-light" | "color-dodge" | "multiply";
export type GradientType = "none" | "linear" | "radial" | "conic";
export type LayerAnimationType = "none" | "pulse" | "breathe" | "orbit" | "drift" | "flicker" | "colorShift";
export type ClipMaskFit = "cover" | "contain" | "fill" | "none";
export type CanvasBackground = "dark" | "light" | "gradient-sunset" | "gradient-ocean" | "gradient-aurora" | "mesh-dark" | "mesh-light" | "dots" | "transparent";
export type FramePreset = "mobile" | "tablet" | "desktop";

export interface GradientStop {
  color: string;
  position: number;
}

export interface ClipMask {
  imageUrl: string;
  fit: ClipMaskFit;
}

export interface LayerAnimation {
  type: LayerAnimationType;
  duration: number;
  delay: number;
  enabled: boolean;
}

export interface NodeStyle {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  backgroundColor?: string;
  color?: string;
  opacity?: number;
  blur?: number;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  boxShadow?: string;
  blendMode?: BlendMode;
  gradient?: GradientType;
  gradientAngle?: number;
  gradientStops?: GradientStop[];
  clipMask?: ClipMask;
  fontSize?: number;
  fontWeight?: number | string;
  fontFamily?: string;
  lineHeight?: number;
  textAlign?: "left" | "center" | "right";
  textDecoration?: string;
}

export interface LayoutProps {
  display?: "flex" | "grid" | "block" | "inline-block";
  flexDirection?: "row" | "column";
  justifyContent?: "flex-start" | "center" | "flex-end" | "space-between" | "space-around";
  alignItems?: "flex-start" | "center" | "flex-end" | "stretch";
  gap?: number;
  padding?: number | [number, number, number, number];
  margin?: number | [number, number, number, number];
}

export interface EditorNode {
  id: string;
  type: NodeType;
  name: string;
  parentId: string | null;
  childIds: string[];
  style: NodeStyle;
  layout?: LayoutProps;
  props: Record<string, unknown>;
  animation?: LayerAnimation;
  visible: boolean;
  locked: boolean;
  metadata?: {
    createdAt?: number;
    updatedAt?: number;
    tags?: string[];
    customData?: Record<string, unknown>;
  };
}

export interface EditorDocument {
  id: string;
  name: string;
  nodes: Record<string, EditorNode>;
  rootNodeIds: string[];
  settings: {
    canvasBackground: CanvasBackground;
    gridVisible: boolean;
    dimensionsVisible: boolean;
    rulersVisible: boolean;
    globalScale: number;
    globalOpacity: number;
    noiseEnabled: boolean;
    noiseIntensity: number;
    power: boolean;
    themeMode: "dark" | "light";
    animation: {
      enabled: boolean;
      type: "pulse" | "breathe" | "none";
      duration: number;
    };
  };
  metadata: {
    createdAt: number;
    updatedAt: number;
    version: number;
  };
}

export interface ViewportState {
  zoom: number;
  offsetX: number;
  offsetY: number;
  frameWidth: number;
  frameHeight: number;
  framePreset: FramePreset;
}

export interface UIState {
  selectedNodeId: string | null;
  selectedNodeIds: string[];
  hoveredNodeId: string | null;
  activeInspectorTab: "style" | "global" | "code";
  showExportModal: boolean;
  showCommandPalette: boolean;
  showABSplit: boolean;
  cssOverride: string | null;
  inspectorScrollTop?: number;
  showGrid: boolean;
  showDimensions: boolean;
  showRulers: boolean;
}

export interface HistorySnapshot {
  document: EditorDocument;
  timestamp: number;
  label?: string;
}

export interface HistoryState {
  past: HistorySnapshot[];
  future: HistorySnapshot[];
}

export interface SavedPreset {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  timestamp: number;
  favorite: boolean;
  document: EditorDocument;
  category?: string;
}

export interface PresetState {
  userPresets: Record<string, SavedPreset>;
  builtInPresets: Record<string, SavedPreset>;
  favorites: string[];
}

export interface DemoDocument {
  id: string;
  name: string;
  description: string;
  category: string;
  document: EditorDocument;
}

export interface EditorStoreState {
  document: EditorDocument;
  ui: UIState;
  viewport: ViewportState;
  history: HistoryState;
  presets: PresetState;
  demoDocuments: DemoDocument[];
  activeDemoDocumentId: string | null;
}

export interface EditorStoreActions {
  setDocument: (document: EditorDocument, options?: { recordHistory?: boolean; label?: string }) => void;
  updateDocumentSettings: (updates: Partial<EditorDocument["settings"]>, options?: { recordHistory?: boolean; label?: string }) => void;
  createNode: (type: NodeType, parentId: string | null, defaults?: Partial<EditorNode>) => string;
  deleteNode: (nodeId: string) => void;
  updateNode: (nodeId: string, updates: Partial<EditorNode>, options?: { recordHistory?: boolean; label?: string }) => void;
  updateNodeStyle: (nodeId: string, updates: Partial<NodeStyle>, options?: { recordHistory?: boolean; label?: string }) => void;
  moveNode: (nodeId: string, newParentId: string | null, index?: number) => void;
  selectNode: (nodeId: string | null, multi?: boolean) => void;
  deselectNode: (nodeId: string) => void;
  clearSelection: () => void;
  setActiveInspectorTab: (tab: "style" | "global" | "code") => void;
  setShowExportModal: (show: boolean) => void;
  setShowCommandPalette: (show: boolean) => void;
  setShowABSplit: (show: boolean) => void;
  setCssOverride: (css: string | null) => void;
  setViewportFlags: (updates: Pick<UIState, "showGrid" | "showDimensions" | "showRulers">) => void;
  setZoom: (zoom: number) => void;
  panViewport: (dx: number, dy: number) => void;
  setFramePreset: (preset: FramePreset) => void;
  savePreset: (name: string, description?: string) => void;
  loadPreset: (presetId: string) => void;
  deletePreset: (presetId: string) => void;
  toggleFavorite: (presetId: string) => void;
  loadDemoDocument: (demoId: string) => void;
  undo: () => void;
  redo: () => void;
  pushHistory: (label?: string) => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}
