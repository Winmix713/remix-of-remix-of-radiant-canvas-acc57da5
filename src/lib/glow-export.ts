import type { GlowState } from "./glow-types";
import { exportAsCSS } from "./glow-types";
import { glowStateToDocument } from "@/editor/adapters/glow-compat";
import { documentToIntermediateRepresentation } from "@/editor/export/intermediate-repr";

export type ExportFormat = "css" | "tailwind" | "react" | "svg";

const gradientToCss = (layer: ReturnType<typeof documentToIntermediateRepresentation>["layers"][number]) => {
  if (layer.gradient !== "none" && layer.gradientStops && layer.gradientStops.length >= 2) {
    const stops = layer.gradientStops.map((stop) => `${stop.color} ${stop.position}%`).join(", ");
    const angle = layer.gradientAngle ?? 90;
    if (layer.gradient === "linear") return `linear-gradient(${angle}deg, ${stops})`;
    if (layer.gradient === "radial") return `radial-gradient(circle, ${stops})`;
    if (layer.gradient === "conic") return `conic-gradient(from ${angle}deg, ${stops})`;
  }
  return layer.color;
};

export function exportAsTailwind(state: GlowState): string {
  const ir = documentToIntermediateRepresentation(glowStateToDocument(state, { name: "Tailwind Export" }));
  const layers = ir.layers
    .filter((layer) => layer.visible)
    .map(
      (layer, index) => `{/* ${layer.name} */}
<div
  className="absolute top-1/2 left-1/2 rounded-full"
  style={{
    transform: 'translate(-50%, -50%) translate(${layer.x}px, ${layer.y}px)',
    width: '${layer.width}px',
    height: '${layer.height}px',
    background: '${gradientToCss(layer)}',
    filter: 'blur(${layer.blur}px)',
    opacity: ${layer.opacity},
    mixBlendMode: '${layer.blendMode}',
    zIndex: ${index},
  }}
/>`
    )
    .join("\n");

  return `{/* Canvas Studio export */}
<div className="relative w-full h-full overflow-hidden">
  <div
    className="absolute inset-0"
    style={{
      transform: 'scale(${ir.settings.globalScale})',
      opacity: ${ir.settings.globalOpacity},
    }}
  >
${layers}
  </div>
</div>`;
}

export function exportAsReactComponent(state: GlowState): string {
  const ir = documentToIntermediateRepresentation(glowStateToDocument(state, { name: "React Export" }));
  const layerConfigs = ir.layers
    .filter((layer) => layer.visible)
    .map(
      (layer) => `  {
    name: ${JSON.stringify(layer.name)},
    x: ${layer.x},
    y: ${layer.y},
    width: ${layer.width},
    height: ${layer.height},
    blur: ${layer.blur},
    opacity: ${layer.opacity},
    blendMode: ${JSON.stringify(layer.blendMode)},
    background: ${JSON.stringify(gradientToCss(layer))},
  },`
    )
    .join("\n");

  return [
    'import React from "react";',
    '',
    'const layers = [',
    layerConfigs,
    '];',
    '',
    'export function CanvasStudioEffect() {',
    '  return (',
    '    <div className="relative w-full h-full overflow-hidden">',
    '      <div',
    '        className="absolute inset-0"',
    `        style={{ transform: "scale(${ir.settings.globalScale})", opacity: ${ir.settings.globalOpacity} }}`,
    '      >',
    '        {layers.map((layer, index) => (',
    '          <div',
    '            key={index}',
    '            className="absolute top-1/2 left-1/2 rounded-full"',
    '            style={{',
    '              transform: "translate(-50%, -50%) translate(" + layer.x + "px, " + layer.y + "px)",',
    '              width: layer.width,',
    '              height: layer.height,',
    '              background: layer.background,',
    '              filter: "blur(" + layer.blur + "px)",',
    '              opacity: layer.opacity,',
    '              mixBlendMode: layer.blendMode,',
    '            }}',
    '          />',
    '        ))}',
    '      </div>',
    '    </div>',
    '  );',
    '}',
  ].join("\n");
}

export function exportAsSVG(state: GlowState, width = 800, height = 600): string {
  const ir = documentToIntermediateRepresentation(glowStateToDocument(state, { name: "SVG Export" }));
  const layers = ir.layers.filter((layer) => layer.visible);
  const filters = layers.map((layer, index) => `  <filter id="blur-${index}"><feGaussianBlur stdDeviation="${layer.blur / 2}" /></filter>`).join("\n");
  const circles = layers.map((layer, index) => `  <ellipse cx="${width / 2 + layer.x}" cy="${height / 2 + layer.y}" rx="${layer.width / 2}" ry="${layer.height / 2}" fill="${layer.color}" opacity="${layer.opacity}" filter="url(#blur-${index})" style="mix-blend-mode:${layer.blendMode}" />`).join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
${filters}
  </defs>
  <rect width="${width}" height="${height}" fill="${ir.settings.themeMode === "dark" ? "#0d0d0d" : "#f5f5f5"}" />
  <g transform="scale(${ir.settings.globalScale})" opacity="${ir.settings.globalOpacity}">
${circles}
  </g>
</svg>`;
}

export function exportForFormat(state: GlowState, format: ExportFormat): string {
  switch (format) {
    case "css":
      return exportAsCSS(state);
    case "tailwind":
      return exportAsTailwind(state);
    case "react":
      return exportAsReactComponent(state);
    case "svg":
      return exportAsSVG(state);
    default:
      return exportAsCSS(state);
  }
}
