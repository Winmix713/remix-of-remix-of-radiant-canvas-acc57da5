import type { BlendMode, EditorDocument, GradientType } from "@/store/types";

export interface IRLayer {
  id: string;
  name: string;
  visible: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  blur: number;
  opacity: number;
  blendMode: BlendMode;
  gradient: GradientType;
  gradientAngle?: number;
  gradientStops?: { color: string; position: number }[];
  animation?: {
    enabled: boolean;
    type: string;
    duration: number;
    delay: number;
  };
}

export interface CanvasIR {
  name: string;
  settings: EditorDocument["settings"];
  layers: IRLayer[];
}

export function documentToIntermediateRepresentation(document: EditorDocument): CanvasIR {
  const layers = Object.values(document.nodes)
    .filter((node) => node.type === "effect-layer")
    .map((node) => ({
      id: node.id,
      name: node.name,
      visible: node.visible,
      x: node.style.x ?? 0,
      y: node.style.y ?? 0,
      width: node.style.width ?? 0,
      height: node.style.height ?? 0,
      color: node.style.color ?? node.style.backgroundColor ?? "#ffffff",
      blur: node.style.blur ?? 0,
      opacity: node.style.opacity ?? 1,
      blendMode: node.style.blendMode ?? "screen",
      gradient: node.style.gradient ?? "none",
      gradientAngle: node.style.gradientAngle,
      gradientStops: node.style.gradientStops,
      animation: node.animation
        ? {
            enabled: node.animation.enabled,
            type: node.animation.type,
            duration: node.animation.duration,
            delay: node.animation.delay,
          }
        : undefined,
    }));

  return {
    name: document.name,
    settings: document.settings,
    layers,
  };
}
