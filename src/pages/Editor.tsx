import { useEffect, useMemo } from "react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { AnimatePresence } from "motion/react";
import { LeftSidebar } from "@/components/glow-editor/LeftSidebar";
import { RightSidebar, ExportModal } from "@/components/glow-editor/RightSidebar";
import { ABSplitView } from "@/components/glow-editor/ABSplitView";
import { CommandPalette } from "@/components/glow-editor/CommandPalette";
import { CanvasShell } from "@/editor/canvas/CanvasShell";
import { documentToGlowState, glowStateToDocument } from "@/editor/adapters/glow-compat";
import { useEditorStore, selectSelectedNode } from "@/store/editor-store";
import { buildShareUrl, getStateFromCurrentUrl } from "@/lib/glow-share";
import { toast } from "sonner";

const setValueAtPath = (target: Record<string, unknown>, path: string, value: unknown) => {
  const keys = path.split(".");
  const lastKey = keys.pop();
  if (!lastKey) return target;

  let current: Record<string, unknown> = target;
  for (const key of keys) {
    current[key] = typeof current[key] === "object" && current[key] !== null
      ? { ...(current[key] as Record<string, unknown>) }
      : {};
    current = current[key] as Record<string, unknown>;
  }

  current[lastKey] = value;
  return target;
};

export default function Editor() {
  const store = useEditorStore();
  const selectedNode = useEditorStore(selectSelectedNode);

  const glowState = useMemo(
    () => documentToGlowState(store.document, store.ui.selectedNodeId, store.ui.cssOverride),
    [store.document, store.ui.selectedNodeId, store.ui.cssOverride]
  );

  useEffect(() => {
    const urlState = getStateFromCurrentUrl();
    if (urlState) {
      store.setDocument(glowStateToDocument(urlState, { name: "Shared Canvas Studio Document" }), {
        label: "Load shared document",
      });
      toast.success("Loaded shared Canvas Studio document");
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }, [store]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z" && !event.shiftKey) {
        event.preventDefault();
        store.undo();
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z" && event.shiftKey) {
        event.preventDefault();
        store.redo();
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        store.setShowCommandPalette(!store.ui.showCommandPalette);
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "e") {
        event.preventDefault();
        store.setShowExportModal(!store.ui.showExportModal);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [store]);

  const handleNodePropertyChange = (path: string, value: unknown) => {
    if (!selectedNode) return;
    const nextNode = JSON.parse(JSON.stringify(selectedNode));
    setValueAtPath(nextNode as Record<string, unknown>, path, value);
    store.updateNode(selectedNode.id, nextNode, { label: `Update ${selectedNode.name}` });
  };

  return (
    <div className="w-full h-screen bg-editor-bg flex flex-col overflow-hidden">
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={18} minSize={14} maxSize={30} className="bg-editor-bg border-r border-editor-border overflow-hidden">
          <LeftSidebar
            state={glowState}
            onStateChange={() => {}}
            onUndo={() => store.undo()}
            onRedo={() => store.redo()}
            canUndo={store.canUndo()}
            canRedo={store.canRedo()}
            onSavePreset={(name) => store.savePreset(name)}
            presetManager={{
              presets: Object.values(store.presets.userPresets),
              favorites: store.presets.favorites,
              builtInPresets: [],
              savePreset: store.savePreset,
              loadPreset: (preset) => store.loadPreset(preset.id),
              deletePreset: store.deletePreset,
              toggleFavorite: store.toggleFavorite,
            }}
            onOpenExport={() => store.setShowExportModal(true)}
            onShare={() => {
              navigator.clipboard.writeText(buildShareUrl(glowState));
              toast.success("Share link copied");
            }}
            onOpenCommandPalette={() => store.setShowCommandPalette(true)}
          />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={64} minSize={40} className="bg-editor-bg overflow-hidden">
          <CanvasShell
            document={store.document}
            selectedNodeId={store.ui.selectedNodeId}
            viewport={store.viewport}
            showGrid={store.ui.showGrid}
            showDimensions={store.ui.showDimensions}
            onSelectNode={(nodeId) => store.selectNode(nodeId)}
            onToggleGrid={() => store.setViewportFlags({
              showGrid: !store.ui.showGrid,
              showDimensions: store.ui.showDimensions,
              showRulers: store.ui.showRulers,
            })}
            onToggleDimensions={() => store.setViewportFlags({
              showGrid: store.ui.showGrid,
              showDimensions: !store.ui.showDimensions,
              showRulers: store.ui.showRulers,
            })}
            onSetFramePreset={store.setFramePreset}
            onSetZoom={store.setZoom}
            onUpdateNodePosition={(nodeId, x, y) => store.updateNodeStyle(nodeId, { x, y }, { label: "Move effect layer" })}
            cssOverride={store.ui.cssOverride}
          />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={18} minSize={14} maxSize={30} className="bg-editor-bg border-l border-editor-border overflow-hidden">
          <RightSidebar
            glowState={glowState}
            selectedNode={selectedNode}
            activeTab={store.ui.activeInspectorTab}
            onActiveTabChange={store.setActiveInspectorTab}
            onNodePropertyChange={handleNodePropertyChange}
            cssOverride={store.ui.cssOverride}
            onCssOverrideChange={store.setCssOverride}
            onGlobalScaleChange={(value) => store.updateDocumentSettings({ globalScale: value }, { label: "Update global scale" })}
            onGlobalOpacityChange={(value) => store.updateDocumentSettings({ globalOpacity: value }, { label: "Update global opacity" })}
            onNoiseToggle={(value) => store.updateDocumentSettings({ noiseEnabled: value }, { label: "Toggle noise" })}
            onNoiseIntensityChange={(value) => store.updateDocumentSettings({ noiseIntensity: value }, { label: "Update noise intensity" })}
          />
        </ResizablePanel>
      </ResizablePanelGroup>

      <AnimatePresence>
        {store.ui.showExportModal && (
          <ExportModal
            state={glowState}
            isOpen={store.ui.showExportModal}
            onClose={() => store.setShowExportModal(false)}
            cssOverride={store.ui.cssOverride}
          />
        )}
        {store.ui.showABSplit && (
          <ABSplitView state={glowState} onClose={() => store.setShowABSplit(false)} />
        )}
      </AnimatePresence>

      <CommandPalette
        isOpen={store.ui.showCommandPalette}
        onClose={() => store.setShowCommandPalette(false)}
        state={glowState}
        onStateChange={() => {}}
        onUndo={() => store.undo()}
        onRedo={() => store.redo()}
        onExport={() => store.setShowExportModal(true)}
        onShare={() => {
          navigator.clipboard.writeText(buildShareUrl(glowState));
          toast.success("Share link copied");
        }}
        onRandomize={() => store.loadDemoDocument("demo-neon-glow")}
      />
    </div>
  );
}
