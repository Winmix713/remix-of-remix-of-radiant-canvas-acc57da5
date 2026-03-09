# REFACTOR TODO — Detailed Implementation Checklist

## COMPLETED (P0 — Foundation)

### ✅ P0.1: Dependency Cleanup
- [x] Remove @hookform/resolvers, date-fns, zod, @tanstack/react-query, recharts, react-day-picker
- [x] Add zustand@^4.5.7
- [x] npm install & verify build

### ✅ P0.2: Store Setup
- [x] Create src/store/types.ts (276 lines)
- [x] Create src/store/editor-store.ts (499 lines, Zustand with 30+ actions)
- [x] Implement document, ui, viewport, history, presets slices
- [x] Add selectors: selectSelectedNode, selectNodeChildren, selectCanUndo, selectCanRedo
- [x] Add persistence middleware (localStorage)

### ✅ P0.3: Constants & Schema
- [x] Create src/editor/core/constants.ts (389 lines)
- [x] Define NODE_TYPE_DEFAULTS for 8 node types
- [x] Define PROPERTY_SCHEMA by node type (layout, appearance, typography, etc.)
- [x] Define animation presets, canvas backgrounds, keyboard shortcuts

### ✅ P0.4: Shared Components
- [x] Create src/components/shared/NumberInput.tsx
- [x] Create src/components/shared/AnimatedSlider.tsx
- [x] (Pending integration: Replace inline duplicates in LeftSidebar/RightSidebar)

### ✅ P0.5: Resizable Layout
- [x] Create src/pages/Editor.tsx (resizable 3-panel)
- [x] Left panel: 15% default, 12-35% min/max
- [x] Center: 70% default, flexible
- [x] Right: 15% default, 12-35% min/max
- [x] Keyboard shortcuts: Cmd+Z, Cmd+K, Cmd+E, etc.

### ✅ P0.6: Tech Debt
- [x] Delete src/components/glow-editor/ControlPanel.tsx (830 lines)
- [x] Verify build (no ControlPanel references)

---

## TODO (P1 — Architecture & Core Editor Engine)

### P1.1: Extract Shared Subcomponents

#### From LeftSidebar.tsx (~1091 lines)
```
Current size: 1091 lines
Extract into:
- src/editor/layers/LayerManager.tsx
  - Currently: inline in LeftSidebar
  - Should handle: layer list UI, drag-to-reorder, parent/child UI
  - Use store: selectNodeChildren(), moveNode(), selectNode()
  - Lines to extract: ~400

- src/editor/presets/PresetManagerUI.tsx
  - Currently: inline in LeftSidebar  
  - Should handle: save/load/favorite UI
  - Use store: savePreset(), loadPreset(), deletePreset(), toggleFavorite()
  - Lines to extract: ~300

- src/editor/presets/TemplateGallery.tsx
  - Currently: inline in LeftSidebar
  - Should handle: template preview grid, click to load
  - Lines to extract: ~200

Result: LeftSidebar becomes composition shell (import LayerManager, PresetManagerUI, TemplateGallery)
```

#### From RightSidebar.tsx (~696 lines)
```
Current size: 696 lines
Extract into:
- src/editor/inspector/PropertyPanel.tsx
  - SCHEMA-DRIVEN: Read from PROPERTY_SCHEMA[selectedNode.type]
  - Dynamically render PropertyGroup(s) + PropertyField(s)
  - Lines: ~200 (declarative, not ~696)

- src/editor/inspector/PropertyGroup.tsx
  - Render single property group (layout, appearance, etc.)
  - Collapsible header + fields
  - Lines: ~50

- src/editor/inspector/PropertyField.tsx
  - Render single property field based on type
  - Handles: number (NumberInput), color (ColorPicker), slider, select, etc.
  - Lines: ~100

- src/editor/inspector/schema/propertySchema.ts
  - Move from constants to dedicated file (larger when expanded)
  - Define PropertyFieldDef, PropertyGroupDef interfaces locally

Result: RightSidebar imports PropertyPanel; no hardcoded sliders
```

#### From GlowPreview.tsx (~559 lines)
```
Current size: 559 lines
Extract into:
- src/editor/canvas/CanvasShell.tsx
  - Toolbar (zoom, grid, bg selector)
  - Rulers
  - Viewport container
  - Lines: ~150

- src/editor/canvas/CanvasViewport.tsx
  - Scrollable canvas container
  - Wraps CanvasRenderer + SelectionOverlay
  - Lines: ~80

- src/editor/canvas/CanvasRenderer.tsx
  - Iterate document.rootNodeIds
  - Render each node by type (glow, box, text, etc.)
  - Unified interaction (click, drag, resize)
  - Lines: ~200

- src/editor/canvas/SelectionOverlay.tsx
  - Selection box bounding rect
  - Resize handles (8 corners/edges)
  - Alignment guides
  - Floating toolbar
  - Lines: ~150

- src/lib/glow-animation.ts
  - Move generateLayerKeyframes(), getLayerAnimationStyle() out of GlowPreview
  - Share with export pipeline, preview, real-time style
  - Lines: ~100

Result: GlowPreview becomes Canvas.tsx (composition of above)
```

#### ExportModal (Currently in RightSidebar.tsx)
```
- Extract to src/editor/export/ExportModal.tsx (~150 lines)
- Import in both RightSidebar and standalone use
```

#### Other Duplicates
```
- MiniPresetPreview: inline in LeftSidebar + RightSidebar
  → src/components/glow-editor/MiniPresetPreview.tsx (~30 lines)

- ColorSwatchRow, ColorHarmonyPanel, GradientEditor, AnimationPanel, ClipMaskPanel
  → Consider extracting if used in both inspector and elsewhere (~50-80 lines each)
```

---

### P1.2: Implement Schema-Driven Inspector

#### src/editor/inspector/Inspector.tsx (Main container)
```typescript
import { PropertyPanel } from "./PropertyPanel";
import { useEditorStore } from "@/store/editor-store";

export function Inspector() {
  const { document, ui } = useEditorStore();
  const selectedNode = document.nodes[ui.selectedNodeId];
  
  if (!selectedNode) return <EmptyState />;
  
  return (
    <div className="inspector-container">
      <div className="inspector-header">{selectedNode.name}</div>
      <PropertyPanel node={selectedNode} />
    </div>
  );
}
```

Checklist:
- [ ] Define PropertyFieldDef, PropertyGroupDef, PropertySchema types
- [ ] Move PROPERTY_SCHEMA from constants.ts (or keep, reference from here)
- [ ] Implement PropertyPanel: reads schema, renders groups
- [ ] Implement PropertyGroup: collapsible group UI
- [ ] Implement PropertyField: renders based on field.type
- [ ] Integrate NumberInput, AnimatedSlider, ColorPicker
- [ ] Update RightSidebar to use Inspector component
- [ ] Test: select a node, verify property panel updates
- [ ] Test: change property, verify node updates in canvas

#### Known Property Types to Handle:
- number (NumberInput)
- slider (AnimatedSlider with range)
- color (ColorPicker or quick swatches)
- select (Radix Select)
- toggle (Radix Switch)
- text (textarea or input)
- gradient (GradientEditor)
- button (special: onclick handler)

---

### P1.3: Multi-Type Renderer System

#### src/editor/canvas/renderers/ folder
```
Create renderer functions for each node type:

glowRenderer.ts
- Input: EditorNode (type="effect-layer"), isSelected, handlers
- Output: JSX (blurred circle/gradient in canvas)
- Reuses current GlowPreview logic
- ~100 lines

boxRenderer.ts
- Input: EditorNode (type="box")
- Output: JSX (styled div)
- ~50 lines

textRenderer.ts
- Input: EditorNode (type="text")
- Output: JSX (text span/p)
- ~50 lines

buttonRenderer.ts, cardRenderer.ts, imageRenderer.ts, containerRenderer.ts, groupRenderer.ts
- Similar structure
- ~50 lines each

index.ts
- Export all renderers
- createRendererMap(): Map<NodeType, NodeRenderer>
```

#### src/editor/canvas/CanvasRenderer.tsx
```typescript
import { renderers } from "./renderers";

export function CanvasRenderer({ document, selectedNodeId, onSelect }) {
  const renderNode = (nodeId: string) => {
    const node = document.nodes[nodeId];
    const isSelected = nodeId === selectedNodeId;
    const Renderer = renderers[node.type];
    
    if (!Renderer) return <UnknownNodeFallback node={node} />;
    
    return (
      <Renderer
        key={nodeId}
        node={node}
        isSelected={isSelected}
        onSelect={onSelect}
        onDragStart={(dx, dy) => { /* ... */ }}
        onResize={(w, h) => { /* ... */ }}
      />
    );
  };
  
  return (
    <div className="canvas-renderer">
      {document.rootNodeIds.map((id) => renderNode(id))}
    </div>
  );
}
```

Checklist:
- [ ] Create glowRenderer.ts
- [ ] Create boxRenderer.ts (simple div)
- [ ] Create textRenderer.ts
- [ ] Create buttonRenderer.ts
- [ ] Create cardRenderer.ts
- [ ] Create imageRenderer.ts
- [ ] Create containerRenderer.ts
- [ ] Create groupRenderer.ts
- [ ] Unified interaction (click, drag, resize)
- [ ] Selection box/handles around rendered node
- [ ] Test: create box, text, button; verify render + selection

---

### P1.4: Layer Hierarchy & Tree

#### src/editor/layers/LayerTree.tsx
```typescript
import { useEditorStore } from "@/store/editor-store";
import { LayerItem } from "./LayerItem";

export function LayerTree({ rootNodeIds }) {
  const { document, selectNode } = useEditorStore();
  
  const renderLayer = (nodeId: string, depth: number) => {
    const node = document.nodes[nodeId];
    return (
      <div key={nodeId}>
        <LayerItem node={node} depth={depth} onSelect={selectNode} />
        {node.childIds.length > 0 && (
          <div className="layer-children">
            {node.childIds.map((childId) => renderLayer(childId, depth + 1))}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="layer-tree">
      {rootNodeIds.map((id) => renderLayer(id, 0))}
    </div>
  );
}
```

#### src/editor/layers/LayerItem.tsx
```typescript
import { LayerItem single layer row with:
- Expand/collapse icon (if has children)
- Layer name
- Visibility toggle (eye icon)
- Lock toggle (lock icon)
- Drag handle (for reordering)
```

Checklist:
- [ ] LayerTree component (hierarchical rendering)
- [ ] LayerItem component (single row)
- [ ] Expand/collapse toggle for groups
- [ ] Drag-to-reorder: uses store.moveNode()
- [ ] Visibility toggle: store.updateNode({ visible })
- [ ] Lock toggle: store.updateNode({ locked })
- [ ] Double-click to rename: inline edit -> store.updateNode({ name })
- [ ] Test: create nested layers, verify tree, drag to reorder

---

### P1.5: Selection & Alignment

#### src/editor/canvas/SelectionOverlay.tsx
```typescript
export function SelectionOverlay({ node, isSelected, onResize, zoom }) {
  if (!isSelected) return null;
  
  return (
    <div className="selection-overlay" style={{ /* ... */ }}>
      {/* Selection box (border) */}
      {/* 8 resize handles */}
      {/* Alignment guides (vertical/horizontal) */}
      {/* Floating toolbar */}
    </div>
  );
}
```

Checklist:
- [ ] Selection box (thin colored border)
- [ ] Resize handles (8 corners + 4 edges)
- [ ] Drag handles to resize: store.updateNode({ width, height })
- [ ] Alignment guides (snap to siblings, center)
- [ ] Floating toolbar (duplicate, delete, group)
- [ ] Multi-select: Shift+Click support
- [ ] Test: select node, verify handles, resize, verify canvas updates

---

### P1.6: Action Registry & Command Palette

#### src/editor/command-palette/actionRegistry.ts
```typescript
interface Action {
  id: string;
  label: string;
  category?: string;
  keywords?: string[];
  action: () => void;
}

const registry = new Map<string, Action>();

export function registerAction(action: Action) {
  registry.set(action.id, action);
}

export function getActions(): Action[] {
  return Array.from(registry.values());
}
```

#### Update src/components/glow-editor/CommandPalette.tsx
```typescript
// Instead of building actions inline, consume from registry
const actions = getActions();
```

Checklist:
- [ ] Create actionRegistry.ts with registry pattern
- [ ] Register built-in actions: undo, redo, export, duplicate, delete, group, ungroup
- [ ] Update CommandPalette to use registry
- [ ] Layer module can registerAction() dynamically
- [ ] Presets module can registerAction() dynamically
- [ ] Test: open command palette, search "undo", verify action fires

---

## TODO (P2 — Export & Code Fidelity)

### P2.1: Intermediate Representation

#### src/editor/export/codeGenerator/ast.ts
```typescript
interface ExportNode {
  type: string;                // "div", "span", "button", etc.
  className?: string;
  style?: Record<string, string>;
  children: ExportNode[];
  props?: Record<string, any>;
  content?: string;            // text content
}

export function toExportTree(document: EditorDocument): ExportNode {
  // Convert EditorDocument (normalized) → ExportNode tree (hierarchical)
  // Apply transforms: glow → CSS filter, layout → flexbox, etc.
}
```

Checklist:
- [ ] Convert EditorNode → ExportNode
- [ ] Handle glow → CSS filter transform
- [ ] Handle layout → flexbox/grid transform
- [ ] Handle typography → font styles
- [ ] Preserve hierarchy (children)
- [ ] Test: create document, convert to IR, verify tree structure

---

### P2.2: Refactor Exporters

#### src/editor/export/exporters/cssExporter.ts
```typescript
export function generateCSS(document: EditorDocument): { html: string; css: string } {
  const ir = toExportTree(document);
  const css = generateClasses(ir);
  const html = generateHTML(ir);
  return { html, css };
}
```

#### Similar for reactExporter, tailwindExporter

Checklist:
- [ ] Rewrite cssExporter to use IR
- [ ] Rewrite reactExporter to use IR
- [ ] Rewrite tailwindExporter to use IR
- [ ] Add snapshot tests for each exporter
- [ ] Verify generated code matches canvas visual
- [ ] Test: export as CSS, React, Tailwind; verify code quality

---

### P2.3: Design/Code/Split View

#### src/editor/canvas/EditorModeToggle.tsx
```
Three modes:
1. Canvas-only (current)
2. Code-only (show generated code)
3. Split-view (canvas left, code right)
```

Checklist:
- [ ] Create mode toggle UI (3 buttons)
- [ ] Store mode in ui state
- [ ] Render CanvasRenderer in canvas-only mode
- [ ] Render code panel in code-only mode
- [ ] Render both side-by-side in split-view
- [ ] Sync selection: click canvas → highlight code, vice versa
- [ ] Test: toggle modes, verify layout changes

---

## TODO (P3 — Productization)

### P3.1: Empty State & Onboarding
- [ ] Create src/pages/EmptyState.tsx
- [ ] Show "Canvas Studio Alpha" intro
- [ ] Quick action buttons: "Start from blank", "Load template", "View demo"
- [ ] Show 3-4 starter templates below

### P3.2: 3 Demo Documents
- [ ] Create 3 pre-made demo files (JSON or ESM export)
- [ ] Demo 1: "Neon Glow" — original effect-layer showcase
- [ ] Demo 2: "Landing Hero" — multi-type nodes (text, button, glow)
- [ ] Demo 3: "Card Component" — component-focused use-case

### P3.3: Smoke & Unit Tests
- [ ] src/store/__tests__/documentStore.test.ts
- [ ] src/editor/export/__tests__/exporters.test.ts
- [ ] Test: create/delete/update/select nodes
- [ ] Test: undo/redo
- [ ] Test: save/load presets
- [ ] E2E smoke test: create → edit → export workflow

### P3.4: Backend-Ready Save Model
- [ ] Create src/lib/api.ts with EditorAPI interface
- [ ] Implement LocalEditorAPI (localStorage)
- [ ] Provide RestEditorAPI stub (for future backend)
- [ ] Store uses API abstraction (injected at runtime)

### P3.5: Landing Page Simplification
- [ ] Simplify src/pages/Landing.tsx
- [ ] Remove glow-specific marketing
- [ ] Keep: product name, brief description, CTA to editor
- [ ] Add: link to docs (future)

---

## Integration Order (Recommended)

1. **P1.1** Extract subcomponents (LeftSidebar, RightSidebar, GlowPreview)
2. **P1.2** Implement schema-driven PropertyPanel
3. **P1.3** Multi-type CanvasRenderer (glow + box + text minimum)
4. **P1.4** LayerTree with hierarchy
5. **P1.5** SelectionOverlay with alignment
6. **P1.6** Action registry
7. Test build, integrate into Index.tsx
8. Continue P2 + P3 in parallel

---

## Testing Checklist

After each major section:
- [ ] TypeScript: no errors
- [ ] Build: `npm run build` succeeds
- [ ] Dev server: `npm run dev` starts
- [ ] UI: visual regression check (screenshot comparison if possible)
- [ ] Interaction: click, drag, keyboard shortcuts work
- [ ] State: inspect Zustand store in Redux DevTools
- [ ] Export: generated code is readable and correct

---

## Files Summary

| File | Size | Status | Notes |
|------|------|--------|-------|
| src/store/types.ts | 276 | ✅ Done | EditorNode, EditorDocument types |
| src/store/editor-store.ts | 499 | ✅ Done | Zustand store, 30+ actions |
| src/editor/core/constants.ts | 389 | ✅ Done | Defaults, schema, shortcuts |
| src/components/shared/NumberInput.tsx | 53 | ✅ Done | Unified number input |
| src/components/shared/AnimatedSlider.tsx | 30 | ✅ Done | Slider with motion |
| src/pages/Editor.tsx | 213 | ✅ Done | Resizable 3-panel layout |
| src/editor/layers/LayerTree.tsx | ~150 | ⏳ P1.4 | |
| src/editor/layers/LayerItem.tsx | ~80 | ⏳ P1.4 | |
| src/editor/inspector/Inspector.tsx | ~100 | ⏳ P1.2 | |
| src/editor/inspector/PropertyPanel.tsx | ~150 | ⏳ P1.2 | |
| src/editor/inspector/PropertyGroup.tsx | ~50 | ⏳ P1.2 | |
| src/editor/inspector/PropertyField.tsx | ~100 | ⏳ P1.2 | |
| src/editor/canvas/CanvasRenderer.tsx | ~200 | ⏳ P1.3 | |
| src/editor/canvas/renderers/*.ts | ~50-100 each | ⏳ P1.3 | 8 renderers |
| src/editor/canvas/SelectionOverlay.tsx | ~150 | ⏳ P1.5 | |
| src/editor/command-palette/actionRegistry.ts | ~80 | ⏳ P1.6 | |
| src/editor/export/codeGenerator/ast.ts | ~100 | ⏳ P2.1 | |
| TOTAL NEW/MODIFIED | ~3000 | 40% done | |

---

End of REFACTOR_TODO.md
