import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Code, Palette, Settings2, FileText, FileCode2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { NumberInput } from "@/components/shared/NumberInput";
import { AnimatedSlider } from "@/components/shared/AnimatedSlider";
import { PropertyPanel } from "@/editor/inspector/PropertyPanel";
import { exportForFormat, type ExportFormat } from "@/lib/glow-export";
import type { EditorNode } from "@/store/types";
import type { GlowState } from "@/lib/glow-types";

interface ExportModalProps {
  state: GlowState;
  isOpen: boolean;
  onClose: () => void;
  cssOverride: string | null;
}

export function ExportModal({ state, isOpen, onClose, cssOverride }: ExportModalProps) {
  const [format, setFormat] = useState<ExportFormat>("css");
  const [copied, setCopied] = useState(false);
  const code = cssOverride && format === "css" ? cssOverride : exportForFormat(state, format);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success(`${format.toUpperCase()} copied`);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-md z-[200] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.98, opacity: 0, y: 8 }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
            className="glass-surface rounded-2xl p-6 max-w-3xl w-full max-h-[82vh] flex flex-col shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-foreground">Export</h3>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors text-lg">✕</button>
            </div>

            <div className="flex gap-1 mb-4 bg-editor-surface rounded-xl p-1 relative">
              {[
                { id: "css" as const, label: "CSS", icon: FileText },
                { id: "tailwind" as const, label: "Tailwind", icon: Code },
                { id: "react" as const, label: "React", icon: FileCode2 },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setFormat(id)}
                  className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-2 relative z-10 ${format === id ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                  {format === id && (
                    <motion.div
                      layoutId="export-tab-bg"
                      className="absolute inset-0 bg-secondary rounded-lg shadow-sm -z-10"
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="relative flex-1 bg-background rounded-xl border border-border overflow-hidden">
              <button onClick={handleCopy} className="absolute top-3 right-3 p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-all z-10">
                {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
              </button>
              <pre className="p-5 text-xs font-mono overflow-auto h-full max-h-[52vh] leading-relaxed whitespace-pre-wrap break-all text-muted-foreground">
                {code}
              </pre>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface RightSidebarProps {
  glowState: GlowState;
  selectedNode?: EditorNode | null;
  activeTab: "style" | "global" | "code";
  onActiveTabChange: (tab: "style" | "global" | "code") => void;
  onNodePropertyChange: (path: string, value: unknown) => void;
  cssOverride: string | null;
  onCssOverrideChange: (value: string | null) => void;
  onGlobalScaleChange: (value: number) => void;
  onGlobalOpacityChange: (value: number) => void;
  onNoiseToggle: (value: boolean) => void;
  onNoiseIntensityChange: (value: number) => void;
}

export function RightSidebar({
  glowState,
  selectedNode,
  activeTab,
  onActiveTabChange,
  onNodePropertyChange,
  cssOverride,
  onCssOverrideChange,
  onGlobalScaleChange,
  onGlobalOpacityChange,
  onNoiseToggle,
  onNoiseIntensityChange,
}: RightSidebarProps) {
  const tabs = useMemo(
    () => [
      { id: "style" as const, label: "Style", icon: Palette },
      { id: "global" as const, label: "Global", icon: Settings2 },
      { id: "code" as const, label: "Code", icon: Code },
    ],
    []
  );

  return (
    <div className="h-full glass-surface rounded-3xl flex flex-col overflow-hidden m-1.5 border-white/5 shadow-2xl">
      <div className="p-4 pb-0 bg-white/[0.02]">
        <div className="flex bg-black/20 rounded-2xl p-1 gap-1 border border-white/5 relative">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onActiveTabChange(id)}
              className={`flex-1 py-2 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-2 relative z-10 ${activeTab === id ? "text-white" : "text-white/40 hover:text-white/70"}`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
              {activeTab === id && (
                <motion.div
                  layoutId="right-tab-bg"
                  className="absolute inset-0 bg-white/[0.05] border border-white/10 rounded-xl shadow-lg -z-10"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 pt-4">
        {activeTab === "style" && (
          <PropertyPanel node={selectedNode} onChange={onNodePropertyChange} />
        )}

        {activeTab === "global" && (
          <div className="space-y-4">
            <section className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center gap-3">
                  <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider">Scale</span>
                  <NumberInput value={glowState.globalScale} onChange={onGlobalScaleChange} step={0.05} min={0.5} max={2} />
                </div>
                <AnimatedSlider value={[glowState.globalScale]} onValueChange={(value) => onGlobalScaleChange(value[0])} min={0.5} max={2} step={0.05} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center gap-3">
                  <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider">Opacity</span>
                  <NumberInput value={glowState.globalOpacity} onChange={onGlobalOpacityChange} step={0.01} min={0} max={1} />
                </div>
                <AnimatedSlider value={[glowState.globalOpacity]} onValueChange={(value) => onGlobalOpacityChange(value[0])} min={0} max={1} step={0.01} />
              </div>
            </section>

            <section className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] font-bold text-white uppercase tracking-widest">Noise Overlay</div>
                  <div className="text-[9px] text-muted-foreground mt-0.5">Organic texture for the demo canvas</div>
                </div>
                <input type="checkbox" checked={glowState.noiseEnabled} onChange={(event) => onNoiseToggle(event.target.checked)} />
              </div>

              {glowState.noiseEnabled && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center gap-3">
                    <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider">Intensity</span>
                    <NumberInput value={glowState.noiseIntensity} onChange={onNoiseIntensityChange} step={0.01} min={0} max={1} />
                  </div>
                  <AnimatedSlider value={[glowState.noiseIntensity]} onValueChange={(value) => onNoiseIntensityChange(value[0])} min={0} max={1} step={0.01} />
                </div>
              )}
            </section>
          </div>
        )}

        {activeTab === "code" && (
          <section className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 h-full space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-white uppercase tracking-widest">Live CSS Override</span>
              {cssOverride && (
                <button onClick={() => onCssOverrideChange(null)} className="text-[10px] font-bold text-primary hover:text-primary/80 transition-colors">
                  Reset
                </button>
              )}
            </div>
            <textarea
              value={cssOverride ?? exportForFormat(glowState, "css")}
              onChange={(event) => onCssOverrideChange(event.target.value)}
              className="w-full h-[420px] bg-black/40 p-4 rounded-xl font-mono text-[11px] text-white/70 leading-relaxed outline-none border border-white/5 focus:border-primary/40 focus:text-white resize-none transition-all custom-scrollbar"
              spellCheck={false}
            />
          </section>
        )}
      </div>
    </div>
  );
}
