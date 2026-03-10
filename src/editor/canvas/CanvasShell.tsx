import { useRef, useState } from "react";
import { motion, AnimatePresence, type PanInfo } from "motion/react";
import { toPng } from "html-to-image";
import {
  Smartphone,
  Tablet,
  Monitor,
  Grid3X3,
  Download,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { documentToGlowState } from "@/editor/adapters/glow-compat";
import { exportAsSVG } from "@/lib/glow-export";
import { getLayerBackground } from "@/lib/glow-types";
import type { EditorDocument, EditorNode, FramePreset, ViewportState } from "@/store/types";

interface CanvasShellProps {
  document: EditorDocument;
  selectedNodeId: string | null;
  viewport: ViewportState;
  showGrid: boolean;
  showDimensions: boolean;
  onSelectNode: (nodeId: string) => void;
  onToggleGrid: () => void;
  onToggleDimensions: () => void;
  onSetFramePreset: (preset: FramePreset) => void;
  onSetZoom: (zoom: number) => void;
  onUpdateNodePosition: (nodeId: string, x: number, y: number) => void;
  cssOverride: string | null;
}

const backgrounds = [
  { id: "dark", label: "Dark", style: { background: "#0a0a0a" } },
  { id: "light", label: "Light", style: { background: "#f5f5f5" } },
  { id: "gradient-sunset", label: "Sunset", style: { background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)" } },
  { id: "gradient-ocean", label: "Ocean", style: { background: "linear-gradient(135deg, #0c1445, #1a237e, #0d47a1)" } },
  { id: "gradient-aurora", label: "Aurora", style: { background: "linear-gradient(135deg, #0d0d0d, #1a0a2e, #0a2a1a, #0d0d0d)" } },
  { id: "mesh-dark", label: "Mesh", style: { background: "radial-gradient(at 40% 20%, #1a1a2e 0px, transparent 50%), radial-gradient(at 80% 0%, #16213e 0px, transparent 50%), radial-gradient(at 0% 50%, #0f3460 0px, transparent 50%), #0a0a0a" } },
  { id: "dots", label: "Dots", style: { background: "#0a0a0a", backgroundImage: "radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)", backgroundSize: "20px 20px" } },
  { id: "transparent", label: "Check", style: { background: "repeating-conic-gradient(rgba(255,255,255,0.05) 0% 25%, transparent 0% 50%) 0 0 / 20px 20px", backgroundColor: "#0a0a0a" } },
] as const;

const frameIcons = {
  mobile: Smartphone,
  tablet: Tablet,
  desktop: Monitor,
};

function renderEffectNode(node: EditorNode, selectedNodeId: string | null, onSelectNode: (nodeId: string) => void, onUpdateNodePosition: (nodeId: string, x: number, y: number) => void) {
  const glowState = documentToGlowState({
    id: "tmp",
    name: "tmp",
    nodes: { root: { id: "root", type: "group", name: "root", parentId: null, childIds: [node.id], style: {}, props: {}, visible: true, locked: false }, [node.id]: node },
    rootNodeIds: ["root"],
    settings: {
      canvasBackground: "dark",
      gridVisible: false,
      dimensionsVisible: false,
      rulersVisible: false,
      globalScale: 1,
      globalOpacity: 1,
      noiseEnabled: false,
      noiseIntensity: 0,
      power: true,
      themeMode: "dark",
      animation: { enabled: false, type: "none", duration: 0 },
    },
    metadata: { createdAt: 0, updatedAt: 0, version: 1 },
  });
  const layer = glowState.layers[0];

  return (
    <motion.button
      key={node.id}
      drag
      dragMomentum={false}
      onDragEnd={(_, info: PanInfo) => {
        onUpdateNodePosition(node.id, (node.style.x ?? 0) + info.offset.x, (node.style.y ?? 0) + info.offset.y);
      }}
      onClick={() => onSelectNode(node.id)}
      className={`absolute top-1/2 left-1/2 rounded-full border transition-all ${selectedNodeId === node.id ? "border-primary/70" : "border-transparent"}`}
      style={{
        transform: `translate(-50%, -50%) translate(${layer.x}px, ${layer.y}px)`,
        width: layer.width,
        height: layer.height,
        background: getLayerBackground(layer),
        filter: `blur(${layer.blur}px)`,
        opacity: layer.opacity,
        mixBlendMode: layer.blendMode,
      }}
    />
  );
}

export function CanvasShell({
  document,
  selectedNodeId,
  viewport,
  showGrid,
  showDimensions,
  onSelectNode,
  onToggleGrid,
  onToggleDimensions,
  onSetFramePreset,
  onSetZoom,
  onUpdateNodePosition,
}: CanvasShellProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [showBackgrounds, setShowBackgrounds] = useState(false);
  const background = backgrounds.find((entry) => entry.id === document.settings.canvasBackground) ?? backgrounds[0];

  const exportPng = async () => {
    if (!previewRef.current) return;
    const dataUrl = await toPng(previewRef.current, { cacheBust: true, pixelRatio: 2 });
    const link = window.document.createElement("a");
    link.href = dataUrl;
    link.download = `canvas-studio-${Date.now()}.png`;
    link.click();
    toast.success("PNG exported");
  };

  const exportSvg = () => {
    const glowState = documentToGlowState(document, selectedNodeId);
    const svg = exportAsSVG(glowState, viewport.frameWidth, viewport.frameHeight);
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `canvas-studio-${Date.now()}.svg`;
    link.click();
    toast.success("SVG exported");
  };

  return (
    <div className="flex flex-col h-full w-full relative group/canvas">
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4 opacity-70 hover:opacity-100 transition-all">
        <div className="flex items-center gap-1.5 p-2 px-3 bg-black/60 border border-white/10 backdrop-blur-3xl rounded-[1.5rem] shadow-2xl">
          {(["mobile", "tablet", "desktop"] as FramePreset[]).map((preset) => {
            const Icon = frameIcons[preset];
            return (
              <button
                key={preset}
                onClick={() => onSetFramePreset(preset)}
                className={`p-2 rounded-xl transition-colors ${viewport.framePreset === preset ? "bg-white/10 text-white" : "text-white/40 hover:text-white"}`}
              >
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5 p-2 px-4 bg-black/60 border border-white/10 backdrop-blur-3xl rounded-[1.5rem] shadow-2xl">
          <button onClick={() => onSetZoom(viewport.zoom - 0.1)} className="p-2 rounded-xl text-white/60 hover:text-white"><ZoomOut className="w-4 h-4" /></button>
          <button onClick={() => onSetZoom(1)} className="px-3 py-1.5 text-[11px] text-white/60 hover:text-white font-black min-w-[54px] text-center tracking-widest">
            {Math.round(viewport.zoom * 100)}%
          </button>
          <button onClick={() => onSetZoom(viewport.zoom + 0.1)} className="p-2 rounded-xl text-white/60 hover:text-white"><ZoomIn className="w-4 h-4" /></button>
        </div>

        <div className="flex items-center gap-1.5 p-2 px-3 bg-black/60 border border-white/10 backdrop-blur-3xl rounded-[1.5rem] shadow-2xl">
          <button onClick={onToggleDimensions} className={`p-2 rounded-xl ${showDimensions ? "bg-white/10 text-white" : "text-white/40 hover:text-white"}`}><Maximize2 className="w-4 h-4" /></button>
          <button onClick={onToggleGrid} className={`p-2 rounded-xl ${showGrid ? "bg-white/10 text-white" : "text-white/40 hover:text-white"}`}><Grid3X3 className="w-4 h-4" /></button>
          <button onClick={() => setShowBackgrounds((value) => !value)} className="p-2 rounded-xl text-white/40 hover:text-white"><ImageIcon className="w-4 h-4" /></button>
          <button onClick={exportPng} className="p-2 rounded-xl bg-primary/20 text-primary hover:bg-primary hover:text-black"><Download className="w-4 h-4" /></button>
          <button onClick={exportSvg} className="p-2 rounded-xl text-white/40 hover:text-white text-xs font-bold">SVG</button>
        </div>
      </div>

      <AnimatePresence>
        {showBackgrounds && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            className="absolute top-24 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 p-3 bg-black/80 border border-white/10 backdrop-blur-3xl rounded-2xl shadow-2xl"
          >
            {backgrounds.map((entry) => (
              <div key={entry.id} className={`w-8 h-8 rounded-lg border-2 ${entry.id === background.id ? "border-primary" : "border-white/10"}`} style={entry.style} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex items-center justify-center relative overflow-hidden" style={{ background: "#050505" }}>
        <div className="relative z-10" style={{ transform: `scale(${viewport.zoom})`, transformOrigin: "center center", transition: "transform 0.3s ease" }}>
          <div
            ref={previewRef}
            className="relative overflow-hidden rounded-[2rem] border shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_40px_120px_-20px_rgba(0,0,0,0.8)]"
            style={{
              width: viewport.frameWidth,
              height: viewport.frameHeight,
              ...background.style,
              borderColor: "rgba(255,255,255,0.1)",
            }}
          >
            {showGrid && (
              <div
                className="absolute inset-0 z-20 pointer-events-none"
                style={{
                  backgroundImage: "linear-gradient(hsla(0 0% 100% / 0.07) 1px, transparent 1px), linear-gradient(90deg, hsla(0 0% 100% / 0.07) 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                }}
              />
            )}

            {showDimensions && (
              <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
                <div className="w-px h-full bg-primary/10 absolute" />
                <div className="h-px w-full bg-primary/10 absolute" />
              </div>
            )}

            <div
              className="absolute inset-0"
              style={{
                transform: `scale(${document.settings.globalScale})`,
                opacity: document.settings.power ? document.settings.globalOpacity : 0,
              }}
            >
              {Object.values(document.nodes)
                .filter((node) => node.type === "effect-layer")
                .map((node) => renderEffectNode(node, selectedNodeId, onSelectNode, onUpdateNodePosition))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
