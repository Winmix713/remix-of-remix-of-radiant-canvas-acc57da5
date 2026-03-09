import { useState, useCallback, useMemo, useEffect } from "react";
import { AnimatePresence } from "motion/react";
import { GlowPreview } from "@/components/glow-editor/GlowPreview";
import { LeftSidebar } from "@/components/glow-editor/LeftSidebar";
import { RightSidebar, ExportModal } from "@/components/glow-editor/RightSidebar";
import { ABSplitView, ABSplitToggle } from "@/components/glow-editor/ABSplitView";
import { CommandPalette } from "@/components/glow-editor/CommandPalette";
import { useHistory, usePresets } from "@/hooks/use-glow-editor";
import { usePersistedState } from "@/hooks/use-persisted-state";
import { exportAsCSS, debounce, INITIAL_STATE } from "@/lib/glow-types";
import { generateRandomGlow } from "@/lib/glow-utils";
import { buildShareUrl, getStateFromCurrentUrl } from "@/lib/glow-share";
import { toast } from "sonner";
import type { GlowState } from "@/lib/glow-types";

export default function Index() {
  const { state: currentState, setState: setCurrentState } = usePersistedState();
  const [cssOverride, setCssOverride] = useState<string | null>(null);
  const [showABSplit, setShowABSplit] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const history = useHistory(currentState);
  const presetManager = usePresets(INITIAL_STATE);

  // Load state from URL hash on mount
  useEffect(() => {
    const urlState = getStateFromCurrentUrl();
    if (urlState) {
      setCurrentState(urlState);
      toast.success("Loaded shared glow effect!");
      // Clean hash
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }, []);

  const debouncedHistoryPush = useMemo(
    () => debounce((state: GlowState) => { history.pushState(state); }, 500),
    [history]
  );

  const handleStateChange = useCallback(
    (newState: GlowState) => {
      setCurrentState(newState);
      debouncedHistoryPush(newState);
    },
    [setCurrentState, debouncedHistoryPush]
  );

  const handleUndo = useCallback(() => {
    const prevState = history.undo();
    if (prevState) { setCurrentState(prevState); setCssOverride(null); }
  }, [history, setCurrentState]);

  const handleRedo = useCallback(() => {
    const nextState = history.redo();
    if (nextState) { setCurrentState(nextState); setCssOverride(null); }
  }, [history, setCurrentState]);

  const handleSavePreset = useCallback(
    (name: string) => { presetManager.savePreset(name, currentState); },
    [currentState, presetManager]
  );

  const handleShare = useCallback(() => {
    const url = buildShareUrl(currentState);
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Share link copied to clipboard!");
    }).catch(() => {
      // Fallback: show URL
      toast.info("Share URL generated - copy from address bar");
      window.location.hash = `s=${btoa(encodeURIComponent(JSON.stringify(currentState)))}`;
    });
  }, [currentState]);

  const handleRandomize = useCallback(() => {
    handleStateChange(generateRandomGlow());
    toast.success("Randomized!");
  }, [handleStateChange]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); setShowCommandPalette(true); }
      else if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) { e.preventDefault(); handleUndo(); }
      else if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) { e.preventDefault(); handleRedo(); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo, handleRedo]);

  const activeCss = cssOverride ?? exportAsCSS(currentState);

  return (
    <div className="h-screen editor-bg text-foreground font-sans selection:bg-primary/30 overflow-hidden flex flex-col">
      <style dangerouslySetInnerHTML={{ __html: activeCss }} />

      {/* 3-column workspace */}
      <div className="flex-1 flex gap-2 p-2 min-h-0">
        {/* Left Sidebar */}
        <LeftSidebar
          state={currentState}
          onStateChange={handleStateChange}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={history.canUndo}
          canRedo={history.canRedo}
          onSavePreset={handleSavePreset}
          presetManager={presetManager}
          onOpenExport={() => setShowExportModal(true)}
          onShare={handleShare}
          onOpenCommandPalette={() => setShowCommandPalette(true)}
        />

        {/* Center Canvas */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 gap-2 p-2 relative group">
          <div className="absolute inset-0 bg-primary/2 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none rounded-[3rem] blur-3xl shadow-inner" />

          <AnimatePresence>
            {showABSplit && (
              <div className="w-full max-w-[1000px] mx-auto mb-4 z-40">
                <ABSplitView currentState={currentState} onClose={() => setShowABSplit(false)} />
              </div>
            )}
          </AnimatePresence>

          <div className="flex-1 min-h-0 relative bg-black/40 rounded-[3rem] border border-white/10 overflow-hidden shadow-[inset_0_2px_24px_rgba(0,0,0,0.8),0_32px_64px_-16px_rgba(0,0,0,0.6)] backdrop-blur-3xl group-canvas transition-all duration-700 hover:border-white/15">
            <div className="absolute top-6 left-6 flex items-center gap-3 z-50">
              <ABSplitToggle isOpen={showABSplit} onToggle={() => setShowABSplit(!showABSplit)} />
              <div className="h-px w-8 bg-white/10 hidden sm:block" />
              <button
                onClick={() => setShowCommandPalette(true)}
                className="flex items-center gap-2 opacity-30 hover:opacity-80 transition-opacity"
              >
                <kbd className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[9px] font-bold text-white tracking-widest uppercase">⌘K</kbd>
                <span className="text-[10px] text-white font-bold uppercase tracking-wider">Commands</span>
              </button>
            </div>

            <GlowPreview
              state={currentState}
              setPower={(v) => handleStateChange({ ...currentState, power: v })}
              onStateChange={handleStateChange}
              onLayerSelect={(id) => handleStateChange({ ...currentState, selectedLayerId: id })}
              cssOverride={cssOverride}
            />
          </div>
        </div>

        {/* Right Sidebar */}
        <RightSidebar
          state={currentState}
          onStateChange={handleStateChange}
          cssOverride={cssOverride}
          setCssOverride={setCssOverride}
        />
      </div>

      {/* Export Modal */}
      <ExportModal isOpen={showExportModal} onClose={() => setShowExportModal(false)} state={currentState} cssOverride={cssOverride} />

      {/* Command Palette */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        state={currentState}
        onStateChange={handleStateChange}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onExport={() => { setShowCommandPalette(false); setShowExportModal(true); }}
        onShare={handleShare}
        onRandomize={handleRandomize}
      />
    </div>
  );
}
