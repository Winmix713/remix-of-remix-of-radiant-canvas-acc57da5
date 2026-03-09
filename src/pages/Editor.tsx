/**
 * Editor Page - Main editor layout with resizable 3-panel structure
 * Composition of Left (Layers/Presets), Center (Canvas), Right (Inspector) panels
 */

import { useEffect, useCallback } from "react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { AnimatePresence } from "motion/react";
import { GlowPreview } from "@/components/glow-editor/GlowPreview";
import { LeftSidebar } from "@/components/glow-editor/LeftSidebar";
import { RightSidebar, ExportModal } from "@/components/glow-editor/RightSidebar";
import { ABSplitView, ABSplitToggle } from "@/components/glow-editor/ABSplitView";
import { CommandPalette } from "@/components/glow-editor/CommandPalette";
import { useEditorStore } from "@/store/editor-store";
import { useHistory, usePresets } from "@/hooks/use-glow-editor";
import { usePersistedState } from "@/hooks/use-persisted-state";
import { debounce, INITIAL_STATE } from "@/lib/glow-types";
import { buildShareUrl, getStateFromCurrentUrl } from "@/lib/glow-share";
import { toast } from "sonner";
import type { GlowState } from "@/lib/glow-types";

/**
 * Editor component - Main entry point for the editor
 *
 * Architecture:
 * - Zustand store manages normalized EditorDocument state
 * - Legacy GlowState compatibility (temporary, during migration)
 * - 3-panel resizable layout: Left | Center | Right
 * - Keyboard shortcuts, undo/redo, export via hooks
 */
export default function Editor() {
  // =========================================================================
  // STORE & STATE MANAGEMENT
  // =========================================================================

  // Zustand store (new architecture)
  const editorStore = useEditorStore();

  // Legacy state (temporary, for backward compatibility with existing components)
  const { state: currentState, setState: setCurrentState } = usePersistedState();
  const history = useHistory(currentState);
  const presetManager = usePresets(INITIAL_STATE);

  // =========================================================================
  // EFFECTS
  // =========================================================================

  // Load state from URL hash on mount
  useEffect(() => {
    const urlState = getStateFromCurrentUrl();
    if (urlState) {
      setCurrentState(urlState);
      toast.success("Loaded shared glow effect!");
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }, [setCurrentState]);

  // =========================================================================
  // HANDLERS
  // =========================================================================

  const debouncedHistoryPush = useCallback(
    debounce((state: GlowState) => {
      history.pushState(state);
    }, 500),
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
    if (prevState) {
      setCurrentState(prevState);
    }
  }, [history, setCurrentState]);

  const handleRedo = useCallback(() => {
    const nextState = history.redo();
    if (nextState) {
      setCurrentState(nextState);
    }
  }, [history, setCurrentState]);

  // =========================================================================
  // KEYBOARD SHORTCUTS
  // =========================================================================

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+Z: Undo
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      // Cmd+Shift+Z: Redo
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "z") {
        e.preventDefault();
        handleRedo();
      }
      // Cmd+K: Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        editorStore.toggleCommandPalette();
      }
      // Cmd+E: Export
      if ((e.metaKey || e.ctrlKey) && e.key === "e") {
        e.preventDefault();
        editorStore.toggleExportModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo, handleRedo, editorStore]);

  // =========================================================================
  // RENDER - 3-PANEL LAYOUT
  // =========================================================================

  return (
    <div className="w-full h-screen bg-editor-bg flex flex-col overflow-hidden">
      {/* Header / Toolbar could go here */}

      {/* Main 3-panel resizable layout */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* LEFT PANEL: Layers & Presets */}
        <ResizablePanel defaultSize={15} minSize={12} maxSize={35} className="bg-editor-bg border-r border-editor-border">
          <LeftSidebar
            state={currentState}
            onStateChange={handleStateChange}
            history={history}
            presetManager={presetManager}
          />
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* CENTER PANEL: Canvas */}
        <ResizablePanel defaultSize={70} minSize={40} className="bg-editor-bg">
          <AnimatePresence mode="wait">
            {currentState && (
              <GlowPreview
                key={currentState.id || "canvas"}
                state={currentState}
                onStateChange={handleStateChange}
                showABSplit={editorStore.ui.showABSplit}
              />
            )}
          </AnimatePresence>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* RIGHT PANEL: Inspector & Export */}
        <ResizablePanel defaultSize={15} minSize={12} maxSize={35} className="bg-editor-bg border-l border-editor-border overflow-hidden">
          {currentState && (
            <RightSidebar
              state={currentState}
              onStateChange={handleStateChange}
              cssOverride={editorStore.ui.cssOverride}
              onCssOverrideChange={(css) => {
                // TODO: Sync to store
              }}
              showExportModal={editorStore.ui.showExportModal}
              onExportModalChange={(show) => {
                if (show) editorStore.toggleExportModal();
                else editorStore.toggleExportModal();
              }}
            />
          )}
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Modals & Overlays */}
      <AnimatePresence>
        {editorStore.ui.showExportModal && currentState && (
          <ExportModal
            state={currentState}
            onClose={() => editorStore.toggleExportModal()}
          />
        )}
        {editorStore.ui.showABSplit && currentState && (
          <ABSplitView state={currentState} onClose={() => editorStore.toggleABSplit()} />
        )}
      </AnimatePresence>

      {/* Command Palette */}
      {editorStore.ui.showCommandPalette && (
        <CommandPalette
          onClose={() => editorStore.toggleCommandPalette()}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={history.currentIndex > 0}
          canRedo={history.currentIndex < history.states.length - 1}
          onExport={() => editorStore.toggleExportModal()}
          onToggleABSplit={() => editorStore.toggleABSplit()}
        />
      )}
    </div>
  );
}
