import type { EditorNode, GradientType, NodeType } from "@/store/types";

export type PropertyFieldType = "number" | "color" | "select" | "toggle" | "text";

export interface PropertyFieldSchema {
  key: string;
  label: string;
  type: PropertyFieldType;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  options?: { label: string; value: string }[];
}

export interface PropertyGroupSchema {
  id: string;
  label: string;
  fields: PropertyFieldSchema[];
  condition?: (node: EditorNode) => boolean;
}

export interface PropertySchema {
  groups: PropertyGroupSchema[];
}

const blendModeOptions = [
  { label: "Normal", value: "normal" },
  { label: "Screen", value: "screen" },
  { label: "Overlay", value: "overlay" },
  { label: "Soft Light", value: "soft-light" },
  { label: "Color Dodge", value: "color-dodge" },
  { label: "Multiply", value: "multiply" },
];

const gradientOptions: { label: string; value: GradientType }[] = [
  { label: "Solid", value: "none" },
  { label: "Linear", value: "linear" },
  { label: "Radial", value: "radial" },
  { label: "Conic", value: "conic" },
];

export const propertySchemas: Partial<Record<NodeType, PropertySchema>> = {
  "effect-layer": {
    groups: [
      {
        id: "appearance",
        label: "Appearance",
        fields: [
          { key: "name", label: "Name", type: "text" },
          { key: "style.color", label: "Color", type: "color" },
          { key: "style.blur", label: "Blur", type: "number", min: 0, max: 300, step: 1, unit: "px" },
          { key: "style.opacity", label: "Opacity", type: "number", min: 0, max: 1, step: 0.01 },
          { key: "visible", label: "Visible", type: "toggle" },
        ],
      },
      {
        id: "geometry",
        label: "Geometry",
        fields: [
          { key: "style.width", label: "Width", type: "number", min: 0, max: 1200, step: 1, unit: "px" },
          { key: "style.height", label: "Height", type: "number", min: 0, max: 1200, step: 1, unit: "px" },
          { key: "style.x", label: "X", type: "number", min: -1000, max: 1000, step: 1, unit: "px" },
          { key: "style.y", label: "Y", type: "number", min: -1000, max: 1000, step: 1, unit: "px" },
        ],
      },
      {
        id: "compositing",
        label: "Compositing",
        fields: [
          { key: "style.blendMode", label: "Blend Mode", type: "select", options: blendModeOptions },
          { key: "style.gradient", label: "Gradient", type: "select", options: gradientOptions },
          { key: "style.gradientAngle", label: "Gradient Angle", type: "number", min: 0, max: 360, step: 1, unit: "°" },
        ],
      },
      {
        id: "animation",
        label: "Animation",
        fields: [
          { key: "animation.enabled", label: "Enabled", type: "toggle" },
          { key: "animation.duration", label: "Duration", type: "number", min: 0.5, max: 20, step: 0.5, unit: "s" },
          { key: "animation.delay", label: "Delay", type: "number", min: 0, max: 10, step: 0.1, unit: "s" },
        ],
      },
    ],
  },
};

export const getPropertySchemaForNode = (node?: EditorNode | null): PropertySchema | null => {
  if (!node) return null;
  return propertySchemas[node.type] ?? null;
};
