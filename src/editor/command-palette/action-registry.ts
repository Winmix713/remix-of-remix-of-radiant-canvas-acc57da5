import type { GlowState } from "@/lib/glow-types";

export interface ActionRegistryItem {
  id: string;
  label: string;
  category: "action" | "layer" | "preset" | "navigation";
  description?: string;
  shortcut?: string;
  run: () => void;
}

interface BuildRegistryArgs {
  glowState: GlowState;
  onUndo: () => void;
  onRedo: () => void;
  onExport: () => void;
  onToggleABSplit: () => void;
}

export function buildActionRegistry({ glowState, onUndo, onRedo, onExport, onToggleABSplit }: BuildRegistryArgs): ActionRegistryItem[] {
  return [
    {
      id: "undo",
      label: "Undo",
      category: "action",
      shortcut: "⌘Z",
      run: onUndo,
    },
    {
      id: "redo",
      label: "Redo",
      category: "action",
      shortcut: "⌘⇧Z",
      run: onRedo,
    },
    {
      id: "export",
      label: "Export",
      category: "action",
      shortcut: "⌘E",
      run: onExport,
    },
    {
      id: "toggle-compare",
      label: "Toggle A/B Compare",
      category: "navigation",
      run: onToggleABSplit,
    },
    ...glowState.layers.map((layer) => ({
      id: `focus-${layer.id}`,
      label: `Focus ${layer.name}`,
      category: "layer" as const,
      description: `${layer.color} • ${layer.visible ? "visible" : "hidden"}`,
      run: () => {},
    })),
  ];
}
