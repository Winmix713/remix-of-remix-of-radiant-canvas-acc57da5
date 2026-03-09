/**
 * Editor Platform - Core Store Types
 * Normalized state model for multi-type node support (glow, box, text, button, etc.)
 */

// ============================================================================
// NODE TYPES & ENUMS
// ============================================================================

export type NodeType = "effect-layer" | "group" | "box" | "text" | "button" | "card" | "container" | "image";

export type BlendMode = "normal" | "screen" | "overlay" | "soft-light" | "color-dodge" | "multiply";
export type GradientType = "none" | "linear" | "radial" | "conic";
export type LayerAnimationType = "none" | "pulse" | "breathe" | "orbit" | "drift" | "flicker" | "colorShift";
export type ClipMaskFit = "cover" | "contain" | "fill" | "none";
export type CanvasBackground = "dark" | "light" | "gradient-sunset" | "gradient-ocean" | "gradient-aurora" | "mesh-dark" | "mesh-light" | "dots" | "transparent";

// ============================================================================
// STYLE & LAYOUT
// ============================================================================

export interface GradientStop {
  color: string;
  position: number; // 0-100
}

export interface ClipMask {
  imageUrl: string;
  fit: ClipMaskFit;
}

export interface LayerAnimation {
  type: LayerAnimationType;
  duration: number;  // seconds
  delay: number;     // seconds
  enabled: boolean;
}

export interface NodeStyle {
  // Position & Size
  x?: number;
  y?: number;
  width?: number;
  height?: number;

  // Appearance
  backgroundColor?: string;
  color?: string;
  opacity?: number;
  blur?: number;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  boxShadow?: string;

  // Blending & Gradient
  blendMode?: BlendMode;
  gradient?: GradientType;
  gradientAngle?: number;
  gradientStops?: GradientStop[];
  clipMask?: ClipMask;

  // Typography (for text nodes)
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

// ============================================================================
// EDITOR NODE (Generalized - can be any type)
// ============================================================================

export interface EditorNode {
  id: string;
  type: NodeType;
  name: string;
  
  // Hierarchy
  parentId: string | null;
  childIds: string[];
  
  // Styling & Layout
  style: NodeStyle;
  layout?: LayoutProps;
  
  // Properties (type-specific)
  props: Record<string, any>;
  
  // Effects & Animation
  animation?: LayerAnimation;
  
  // State
  visible: boolean;
  locked: boolean;
  
  // Metadata
  metadata?: {
    createdAt?: number;
    updatedAt?: number;
    tags?: string[];
    customData?: Record<string, any>;
  };
}

// ============================================================================
// EDITOR DOCUMENT (Normalized state)
// ============================================================================

export interface EditorDocument {
  id: string;
  name: string;
  
  // Normalized nodes by ID (O(1) lookup)
  nodes: Record<string, EditorNode>;
  
  // Root node IDs (top-level canvas elements)
  rootNodeIds: string[];
  
  // Document settings
  settings: {
    canvasBackground: CanvasBackground;
    gridVisible: boolean;
    dimensionsVisible: boolean;
    rulersVisible: boolean;
    globalScale?: number;
    globalOpacity?: number;
    noiseEnabled?: boolean;
    noiseIntensity?: number;
  };
  
  // Metadata
  metadata: {
    createdAt: number;
    updatedAt: number;
    version: number;
  };
}

// ============================================================================
// VIEWPORT & UI STATE
// ============================================================================

export interface ViewportState {
  zoom: number;
  offsetX: number;
  offsetY: number;
  frameWidth: number;
  frameHeight: number;
}

export interface UIState {
  selectedNodeId: string | null;
  selectedNodeIds: string[];  // Multi-select
  hoveredNodeId: string | null;
  
  // Panels
  activeInspectorTab: "style" | "global" | "code";
  showExportModal: boolean;
  showCommandPalette: boolean;
  showABSplit: boolean;
  
  // Inspector
  cssOverride?: string;
  inspectorScrollTop?: number;
  
  // Viewport
  showGrid: boolean;
  showDimensions: boolean;
  showRulers: boolean;
}

// ============================================================================
// HISTORY (Undo/Redo)
// ============================================================================

export interface HistorySnapshot {
  document: EditorDocument;
  timestamp: number;
}

export interface HistoryState {
  past: HistorySnapshot[];
  future: HistorySnapshot[];
}

// ============================================================================
// PRESETS & TEMPLATES
// ============================================================================

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

// ============================================================================
// COMPLETE EDITOR STORE STATE
// ============================================================================

export interface EditorStoreState {
  // Core document
  document: EditorDocument;
  
  // UI & Viewport
  ui: UIState;
  viewport: ViewportState;
  
  // History
  history: HistoryState;
  
  // Presets
  presets: PresetState;
}

// ============================================================================
// ACTIONS & SELECTORS (Type inference helpers)
// ============================================================================

export interface EditorStoreActions {
  // Document management
  createNode: (type: NodeType, parentId: string | null, defaults?: Partial<EditorNode>) => string;
  deleteNode: (nodeId: string) => void;
  updateNode: (nodeId: string, updates: Partial<EditorNode>) => void;
  moveNode: (nodeId: string, newParentId: string | null, index?: number) => void;
  
  // Selection
  selectNode: (nodeId: string, multi?: boolean) => void;
  deselectNode: (nodeId: string) => void;
  clearSelection: () => void;
  
  // UI
  setActiveInspectorTab: (tab: "style" | "global" | "code") => void;
  toggleExportModal: () => void;
  toggleCommandPalette: () => void;
  toggleABSplit: () => void;
  
  // Viewport
  setZoom: (zoom: number) => void;
  panViewport: (dx: number, dy: number) => void;
  
  // Presets
  savePreset: (name: string, description?: string) => void;
  loadPreset: (presetId: string) => void;
  deletePreset: (presetId: string) => void;
  toggleFavorite: (presetId: string) => void;
  
  // History
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;
}
