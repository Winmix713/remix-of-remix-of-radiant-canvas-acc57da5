# EDITOR ARCHITECTURE

## Alpha status update
- The production editor route now uses the three-panel `Editor.tsx` shell.
- The store owns editor document data, viewport controls, inspector tabs, export modal state, command palette state, and demo document selection.
- Legacy glow rendering is kept alive through `src/editor/adapters/glow-compat.ts` to minimize migration risk.
- The inspector is schema-driven for `effect-layer` nodes via `src/editor/core/property-schema.ts` and `src/editor/inspector/*`.
- Export flow is now `EditorDocument -> Intermediate Representation -> formatter`.

## State Model (Zustand)

```
EditorStore
├── document: EditorDocument
│   ├── id, name
│   ├── nodes: Record<string, EditorNode>   // normalizált
│   ├── rootNodeIds: string[]
│   └── settings: DocumentSettings
├── ui: UIState
│   ├── selectedNodeId
│   ├── hoveredNodeId
│   ├── activeInspectorTab
│   ├── showExportModal / showCommandPalette / showABSplit
│   └── cssOverride
├── viewport: ViewportState
│   ├── zoom, frameSize
│   ├── showGrid / showDimensions / showRulers
│   └── background
├── history: HistoryState
│   ├── past / future stacks
│   └── canUndo / canRedo
└── presets: PresetState
    ├── userPresets
    └── builtInPresets (converted from glow-presets)
```

## Entity Model — EditorNode

```typescript
interface EditorNode {
  id: string;
  type: NodeType;          // 'effect-layer' | 'group' | 'box' | 'text' | 'button' | 'card' | 'container' | 'image'
  name: string;
  parentId: string | null;
  childIds: string[];
  style: NodeStyle;        // x, y, width, height, opacity, backgroundColor, blur, borderRadius, mixBlendMode, gradient, clipMask
  animation?: AnimationConfig;
  visible: boolean;
  locked: boolean;
  metadata: Record<string, unknown>;
}
```

### NodeType → Renderelés
| NodeType | Renderelés | Inspector groups |
|----------|-----------|-----------------|
| effect-layer | Blurred circle/gradient | color, blur, opacity, size, blend, gradient, animation, clip |
| group | Container (children inherit opacity/blend) | opacity, blend |
| box | Div with styling | size, position, bg, border, radius, shadow |
| text | Text element | font, size, color, alignment, weight |
| button | Styled button | text, bg, border, radius, padding |
| card | Card container | bg, border, radius, shadow, padding |

## Inspector Schema System

```typescript
interface PropertySchema {
  groups: PropertyGroupSchema[];
}

interface PropertyGroupSchema {
  id: string;
  label: string;
  fields: PropertyFieldSchema[];
  condition?: (node: EditorNode) => boolean;
}

interface PropertyFieldSchema {
  key: string;           // dot-notation path: 'style.blur', 'style.opacity'
  label: string;
  type: 'number' | 'color' | 'select' | 'slider' | 'toggle' | 'text' | 'gradient';
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  options?: { label: string; value: string }[];
}
```

## Export Pipeline

```
EditorDocument
    ↓ (1. Extract)
IntermediateRepr (IR)
    ↓ (2. Transform per format)
CodeOutput { css | tailwind | react | svg }
    ↓ (3. Format)
String (formatted code)
```

## Renderer Architecture

```
CanvasShell
├── CanvasToolbar (viewport, zoom, grid, bg)
├── CanvasViewport
│   ├── CanvasRenderer (iterates nodes, renders by type)
│   └── SelectionOverlay (selection ring, floating toolbar)
├── CanvasRulers
└── StatusBar
```
