/**
 * Editor Core Constants
 * Node type defaults, property schemas, and other configuration
 */

import { NodeType, EditorNode, NodeStyle } from "@/store/types";

// ============================================================================
// NODE TYPE DEFAULTS
// ============================================================================

export const NODE_TYPE_DEFAULTS: Record<NodeType, Partial<EditorNode>> = {
  "effect-layer": {
    style: {
      x: 100,
      y: 100,
      width: 200,
      height: 200,
      backgroundColor: "#FF0000",
      opacity: 0.8,
      blur: 20,
      blendMode: "screen",
    },
    props: {
      color: "#FF0000",
      blur: 20,
      opacity: 0.8,
    },
  },

  group: {
    style: {
      x: 0,
      y: 0,
      width: 400,
      height: 400,
    },
    layout: {
      display: "flex",
      flexDirection: "column",
      gap: 8,
    },
    props: {
      name: "Group",
    },
  },

  box: {
    style: {
      x: 0,
      y: 0,
      width: 200,
      height: 200,
      backgroundColor: "#ffffff",
      borderRadius: 4,
    },
    props: {},
  },

  text: {
    style: {
      x: 0,
      y: 0,
      fontSize: 16,
      fontFamily: "Inter",
      fontWeight: 400,
      color: "#000000",
      textAlign: "left",
    },
    props: {
      content: "Text",
    },
  },

  button: {
    style: {
      x: 0,
      y: 0,
      width: 120,
      height: 40,
      backgroundColor: "#007BFF",
      borderRadius: 4,
      color: "#ffffff",
      fontSize: 14,
      fontWeight: 500,
    },
    layout: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    props: {
      label: "Button",
      onClick: "",
    },
  },

  card: {
    style: {
      x: 0,
      y: 0,
      width: 300,
      height: 400,
      backgroundColor: "#ffffff",
      borderRadius: 8,
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    },
    layout: {
      display: "flex",
      flexDirection: "column",
      gap: 16,
      padding: 16,
    },
    props: {
      title: "Card Title",
    },
  },

  container: {
    style: {
      x: 0,
      y: 0,
      width: 500,
      height: 500,
      backgroundColor: "transparent",
    },
    layout: {
      display: "flex",
      flexDirection: "row",
      gap: 0,
    },
    props: {},
  },

  image: {
    style: {
      x: 0,
      y: 0,
      width: 300,
      height: 300,
      borderRadius: 0,
    },
    props: {
      src: "",
      alt: "Image",
    },
  },
};

// ============================================================================
// PROPERTY SCHEMA
// ============================================================================

export interface PropertyFieldDef {
  key: string;
  label: string;
  type: "number" | "color" | "select" | "slider" | "toggle" | "text" | "gradient" | "button";
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  options?: Array<{ label: string; value: string | number }>;
  condition?: (style: NodeStyle) => boolean;
}

export interface PropertyGroupDef {
  id: string;
  label: string;
  icon?: string;
  fields: PropertyFieldDef[];
  condition?: (nodeType: NodeType) => boolean;
  collapsible?: boolean;
  defaultOpen?: boolean;
}

// Common field definitions (reusable)
const LAYOUT_FIELDS: PropertyFieldDef[] = [
  { key: "style.x", label: "X", type: "number", step: 1, unit: "px" },
  { key: "style.y", label: "Y", type: "number", step: 1, unit: "px" },
  { key: "style.width", label: "Width", type: "number", min: 10, step: 1, unit: "px" },
  { key: "style.height", label: "Height", type: "number", min: 10, step: 1, unit: "px" },
];

const APPEARANCE_FIELDS: PropertyFieldDef[] = [
  { key: "style.backgroundColor", label: "Background", type: "color" },
  { key: "style.opacity", label: "Opacity", type: "slider", min: 0, max: 1, step: 0.01 },
  { key: "style.blendMode", label: "Blend Mode", type: "select", options: [
    { label: "Normal", value: "normal" },
    { label: "Screen", value: "screen" },
    { label: "Overlay", value: "overlay" },
    { label: "Soft Light", value: "soft-light" },
    { label: "Color Dodge", value: "color-dodge" },
    { label: "Multiply", value: "multiply" },
  ]},
];

const EFFECT_LAYER_APPEARANCE: PropertyFieldDef[] = [
  { key: "style.color", label: "Color", type: "color" },
  { key: "style.blur", label: "Blur", type: "slider", min: 0, max: 100, step: 1, unit: "px" },
  { key: "style.opacity", label: "Opacity", type: "slider", min: 0, max: 1, step: 0.01 },
  { key: "style.blendMode", label: "Blend Mode", type: "select", options: [
    { label: "Normal", value: "normal" },
    { label: "Screen", value: "screen" },
    { label: "Overlay", value: "overlay" },
    { label: "Soft Light", value: "soft-light" },
    { label: "Color Dodge", value: "color-dodge" },
    { label: "Multiply", value: "multiply" },
  ]},
];

const TYPOGRAPHY_FIELDS: PropertyFieldDef[] = [
  { key: "style.fontSize", label: "Font Size", type: "number", min: 8, max: 72, step: 1, unit: "px" },
  { key: "style.fontFamily", label: "Font Family", type: "select", options: [
    { label: "Inter", value: "Inter" },
    { label: "JetBrains Mono", value: "JetBrains Mono" },
    { label: "System", value: "system-ui" },
  ]},
  { key: "style.fontWeight", label: "Font Weight", type: "select", options: [
    { label: "Light (300)", value: 300 },
    { label: "Regular (400)", value: 400 },
    { label: "Medium (500)", value: 500 },
    { label: "Semibold (600)", value: 600 },
    { label: "Bold (700)", value: 700 },
  ]},
  { key: "style.color", label: "Color", type: "color" },
  { key: "style.lineHeight", label: "Line Height", type: "number", min: 1, max: 3, step: 0.1 },
  { key: "style.textAlign", label: "Text Align", type: "select", options: [
    { label: "Left", value: "left" },
    { label: "Center", value: "center" },
    { label: "Right", value: "right" },
  ]},
];

const BORDER_FIELDS: PropertyFieldDef[] = [
  { key: "style.borderWidth", label: "Border Width", type: "number", min: 0, max: 10, step: 1, unit: "px" },
  { key: "style.borderColor", label: "Border Color", type: "color" },
  { key: "style.borderRadius", label: "Border Radius", type: "number", min: 0, max: 100, step: 1, unit: "px" },
];

const SHADOW_FIELDS: PropertyFieldDef[] = [
  { key: "style.boxShadow", label: "Box Shadow", type: "text" },
];

// Property schemas by node type
export const PROPERTY_SCHEMA: Record<NodeType, PropertyGroupDef[]> = {
  "effect-layer": [
    {
      id: "size",
      label: "Size",
      fields: LAYOUT_FIELDS,
      defaultOpen: true,
    },
    {
      id: "appearance",
      label: "Appearance",
      fields: EFFECT_LAYER_APPEARANCE,
      defaultOpen: true,
    },
    {
      id: "gradient",
      label: "Gradient",
      fields: [
        { key: "style.gradient", label: "Type", type: "select", options: [
          { label: "None", value: "none" },
          { label: "Linear", value: "linear" },
          { label: "Radial", value: "radial" },
          { label: "Conic", value: "conic" },
        ]},
        { key: "style.gradientAngle", label: "Angle", type: "number", min: 0, max: 360, step: 1 },
      ],
      defaultOpen: false,
    },
    {
      id: "animation",
      label: "Animation",
      fields: [
        { key: "animation.enabled", label: "Enable", type: "toggle" },
        { key: "animation.type", label: "Type", type: "select", options: [
          { label: "None", value: "none" },
          { label: "Pulse", value: "pulse" },
          { label: "Breathe", value: "breathe" },
          { label: "Orbit", value: "orbit" },
          { label: "Drift", value: "drift" },
        ]},
        { key: "animation.duration", label: "Duration", type: "number", min: 0.1, max: 10, step: 0.1, unit: "s" },
        { key: "animation.delay", label: "Delay", type: "number", min: 0, max: 5, step: 0.1, unit: "s" },
      ],
      defaultOpen: false,
    },
  ],

  box: [
    { id: "layout", label: "Layout", fields: LAYOUT_FIELDS, defaultOpen: true },
    { id: "appearance", label: "Appearance", fields: APPEARANCE_FIELDS, defaultOpen: true },
    { id: "border", label: "Border", fields: BORDER_FIELDS, collapsible: true, defaultOpen: false },
    { id: "shadow", label: "Shadow", fields: SHADOW_FIELDS, collapsible: true, defaultOpen: false },
  ],

  text: [
    { id: "layout", label: "Layout", fields: LAYOUT_FIELDS, defaultOpen: true },
    { id: "typography", label: "Typography", fields: TYPOGRAPHY_FIELDS, defaultOpen: true },
  ],

  button: [
    { id: "layout", label: "Layout", fields: LAYOUT_FIELDS, defaultOpen: true },
    { id: "appearance", label: "Appearance", fields: APPEARANCE_FIELDS, defaultOpen: true },
    { id: "typography", label: "Typography", fields: TYPOGRAPHY_FIELDS, defaultOpen: true },
    { id: "border", label: "Border", fields: BORDER_FIELDS, collapsible: true, defaultOpen: false },
  ],

  card: [
    { id: "layout", label: "Layout", fields: LAYOUT_FIELDS, defaultOpen: true },
    { id: "appearance", label: "Appearance", fields: APPEARANCE_FIELDS, defaultOpen: true },
    { id: "border", label: "Border", fields: BORDER_FIELDS, collapsible: true, defaultOpen: false },
    { id: "shadow", label: "Shadow", fields: SHADOW_FIELDS, collapsible: true, defaultOpen: false },
  ],

  group: [
    { id: "layout", label: "Layout", fields: LAYOUT_FIELDS, defaultOpen: true },
    { id: "appearance", label: "Appearance", fields: [{ key: "style.opacity", label: "Opacity", type: "slider", min: 0, max: 1, step: 0.01 }], defaultOpen: true },
  ],

  container: [
    { id: "layout", label: "Layout", fields: LAYOUT_FIELDS, defaultOpen: true },
    { id: "appearance", label: "Appearance", fields: APPEARANCE_FIELDS, defaultOpen: true },
  ],

  image: [
    { id: "layout", label: "Layout", fields: LAYOUT_FIELDS, defaultOpen: true },
    { id: "appearance", label: "Appearance", fields: [{ key: "style.opacity", label: "Opacity", type: "slider", min: 0, max: 1, step: 0.01 }], defaultOpen: true },
    { id: "border", label: "Border", fields: BORDER_FIELDS, collapsible: true, defaultOpen: false },
  ],
};

// ============================================================================
// ANIMATION PRESETS
// ============================================================================

export const ANIMATION_PRESETS = {
  none: { type: "none" as const, duration: 1, delay: 0 },
  pulse: { type: "pulse" as const, duration: 2, delay: 0 },
  breathe: { type: "breathe" as const, duration: 3, delay: 0 },
  orbit: { type: "orbit" as const, duration: 4, delay: 0 },
};

// ============================================================================
// CANVAS BACKGROUNDS
// ============================================================================

export const CANVAS_BACKGROUND_OPTIONS = [
  { label: "Dark", value: "dark" },
  { label: "Light", value: "light" },
  { label: "Sunset Gradient", value: "gradient-sunset" },
  { label: "Ocean Gradient", value: "gradient-ocean" },
  { label: "Aurora Gradient", value: "gradient-aurora" },
  { label: "Dark Mesh", value: "mesh-dark" },
  { label: "Light Mesh", value: "mesh-light" },
  { label: "Dots", value: "dots" },
  { label: "Transparent", value: "transparent" },
];

// ============================================================================
// KEYBOARD SHORTCUTS
// ============================================================================

export const KEYBOARD_SHORTCUTS = {
  undo: "cmd+z",
  redo: "cmd+shift+z",
  delete: "Delete",
  duplicate: "cmd+d",
  commandPalette: "cmd+k",
  export: "cmd+e",
  toggleGrid: "cmd+'",
  zoomIn: "cmd+=",
  zoomOut: "cmd+-",
  zoomFit: "cmd+0",
};

// ============================================================================
// EXPORT SETTINGS
// ============================================================================

export const EXPORT_FORMATS = {
  css: { label: "CSS + HTML", value: "css" },
  react: { label: "React JSX", value: "react" },
  tailwind: { label: "Tailwind CSS", value: "tailwind" },
  svg: { label: "SVG", value: "svg" },
};
