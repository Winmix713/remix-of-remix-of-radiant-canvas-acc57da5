# EDITOR ARCHITECTURE

## 1. State Model (Zustand)

```
EditorStoreState
├── document: EditorDocument (normalized)
│   ├── id: string
│   ├── name: string
│   ├── nodes: Record<string, EditorNode>      // O(1) lookup by ID
│   ├── rootNodeIds: string[]
│   └── settings: DocumentSettings
├── ui: UIState
│   ├── selectedNodeId: string | null
│   ├── selectedNodeIds: string[]              // Multi-select
│   ├── hoveredNodeId: string | null
│   ├── activeInspectorTab: "style"|"global"|"code"
│   ├── showExportModal: boolean
│   ├── showCommandPalette: boolean
│   └── showABSplit: boolean
├── viewport: ViewportState
│   ├── zoom: number
│   ├── offsetX, offsetY: number
│   ├── frameWidth, frameHeight: number
├── history: HistoryState
│   ├── past: HistorySnapshot[]               // Undo stack
│   └── future: HistorySnapshot[]             // Redo stack
└── presets: PresetState
    ├── userPresets: Record<string, SavedPreset>
    ├── builtInPresets: Record<string, SavedPreset>
    └── favorites: string[]
```

### Why Normalized State?
- **O(1) node lookup**: `document.nodes[nodeId]` instant access
- **Efficient updates**: Modify single node without array search
- **Undo/redo snapshots**: Deep clone entire document, fast restore
- **Selection logic**: Quickly resolve selectedNodeId → EditorNode

### Zustand Middleware
- **devtools**: Redux DevTools support for state debugging
- **persist**: localStorage integration (document + presets partialize)

---

## 2. Entity Model — EditorNode

```typescript
interface EditorNode {
  id: string;
  type: NodeType;        // "effect-layer" | "group" | "box" | "text" | "button" | "card" | "container" | "image"
  name: string;
  
  // Hierarchy
  parentId: string | null;
  childIds: string[];    // Direct children IDs (not recursively stored)
  
  // Visual properties
  style: NodeStyle;      // x, y, width, height, color, opacity, blur, blend, ...
  layout?: LayoutProps;  // flex/grid layout props
  
  // Node-specific data
  props: Record<string, any>;  // content, label, src, onClick, etc.
  
  // Effects
  animation?: LayerAnimation;
  
  // State
  visible: boolean;
  locked: boolean;
  
  // Metadata
  metadata?: {
    createdAt?: number;
    updatedAt?: number;
    tags?: string[];
    customData?: Record<string, any>;
  };
}
```

### Node Type Support

| Type | Purpose | Renderer | Inspector Groups |
|------|---------|----------|------------------|
| `effect-layer` | Blurred glow circle/gradient | GlowRenderer | size, appearance, gradient, animation |
| `group` | Container for other nodes | GroupRenderer | layout, appearance |
| `box` | Styled div | BoxRenderer | layout, appearance, border, shadow |
| `text` | Text element | TextRenderer | layout, typography |
| `button` | Styled button | ButtonRenderer | layout, appearance, typography, border |
| `card` | Card/panel container | CardRenderer | layout, appearance, border, shadow |
| `container` | Flexbox/grid container | ContainerRenderer | layout, appearance |
| `image` | Image element | ImageRenderer | layout, appearance, border |

### Hierarchy Model
- Node dapat memiliki children (stored dalam `childIds`)
- `parentId` references parent node
- `rootNodeIds` in document are top-level canvases
- Tree traversal via helper functions: `getAncestors()`, `getDescendants()`, `getSiblings()`

---

## 3. Inspector Schema System

```typescript
interface PropertySchema {
  groups: PropertyGroupDef[];
}

interface PropertyGroupDef {
  id: string;
  label: string;
  icon?: string;
  fields: PropertyFieldDef[];
  condition?: (nodeType: NodeType) => boolean;
  collapsible?: boolean;
  defaultOpen?: boolean;
}

interface PropertyFieldDef {
  key: string;                  // dot-notation: "style.blur", "animation.duration"
  label: string;
  type: "number" | "color" | "select" | "slider" | "toggle" | "text" | "gradient" | "button";
  min?: number;
  max?: number;
  step?: number;
  unit?: string;                // "px", "s", "%", etc.
  options?: Array<{ label, value }>;
  condition?: (style: NodeStyle) => boolean;
}
```

### How It Works
1. User selects node → store.ui.selectedNodeId updated
2. Inspector reads node.type
3. Lookup PROPERTY_SCHEMA[node.type] → PropertyGroupDef[]
4. Render PropertyGroup(s) with PropertyField(s)
5. PropertyField renders based on type (number → NumberInput, color → ColorPicker, etc.)
6. onChange → store.updateNode(nodeId, { ...updates })

### Benefits
- **No hardcoding**: Property layout defined in constants, not JSX
- **Type-safe**: TypeScript ensures field.key matches EditorNode shape
- **Extensible**: Add new property type → update PROPERTY_SCHEMA, PropertyField handles it
- **Composable**: Property groups reused across node types

---

## 4. Export Pipeline

```
EditorDocument
    ↓ (1. Extract & Transform)
IntermediateRepr (IR)
    ├─ Tree structure
    ├─ Style transforms (glow → CSS filter, etc.)
    └─ Asset mapping
    ↓ (2. Format-specific generation)
CodeOutput { css, react, tailwind, svg }
    ↓ (3. Format & polish)
String (code)
```

### Intermediate Representation (IR)
```typescript
interface ExportNode {
  type: string;                        // "div", "span", "button", "img"
  id: string;
  className?: string;
  style?: Record<string, string>;      // Inline CSS
  children: ExportNode[];
  props?: Record<string, any>;         // React props
  content?: string;                    // Text content
}
```

### Exporters
- **cssExporter**: EditorDocument → CSS classes + HTML
- **reactExporter**: EditorDocument → React component
- **tailwindExporter**: EditorDocument → Tailwind CSS
- **svgExporter** (future): EditorDocument → SVG

### Code Fidelity Principle
- Canvas visual → Generated code should match (not approximate)
- Readable output: no minification by default, clean formatting
- Maintainable: generated code should be humanly editable

---

## 5. Renderer Architecture

```
CanvasShell
├── CanvasToolbar (zoom, grid toggle, bg selector, undo/redo)
├── CanvasViewport (scrollable container)
│   ├── CanvasRenderer (main render loop)
│   │   ├─ Iterates document.rootNodeIds
│   │   ├─ For each node, calls type-specific renderer
│   │   └─ renderers/
│   │       ├─ glowRenderer.ts
│   │       ├─ boxRenderer.ts
│   │       ├─ textRenderer.ts
│   │       ├─ imageRenderer.ts
│   │       ├─ buttonRenderer.ts
│   │       ├─ cardRenderer.ts
│   │       ├─ containerRenderer.ts
│   │       └─ groupRenderer.ts
│   └── SelectionOverlay
│       ├─ Selection box (bounding rect)
│       ├─ Resize handles (8 corners + edges)
│       ├─ Alignment guides
│       └─ Floating toolbar (duplicate, delete, layer controls)
├── CanvasRulers (top & left measurement guides)
└── StatusBar (zoom level, selection info)
```

### Renderer Function Signature
```typescript
type NodeRenderer = (props: {
  node: EditorNode;
  isSelected: boolean;
  onSelect: (nodeId: string, multi?: boolean) => void;
  onDragStart: (nodeId: string, dx: number, dy: number) => void;
  onResize: (nodeId: string, newWidth: number, newHeight: number) => void;
  zoom: number;
}) => JSX.Element;
```

### Selection & Interaction
- Click on canvas → raycast to find node, call onSelect
- Drag node → updateNode with new x, y
- Resize handles → updateNode with new width, height
- Shift+Click → multi-select via selectNode(id, multi=true)
- Right-click → context menu (duplicate, delete, group, etc.)

---

## 6. Command Palette & Actions

```typescript
interface Action {
  id: string;
  label: string;
  category?: string;                   // "edit", "view", "export", etc.
  icon?: string;                       // Lucide icon name
  keywords?: string[];                 // Search keywords
  action: () => void;                  // Callback
}

// Registry pattern
const actionRegistry = new Map<string, Action>();

registerAction({
  id: "undo",
  label: "Undo",
  category: "edit",
  keywords: ["undo", "back"],
  action: () => store.undo(),
});

// CommandPalette reads registry, enables plugin-like registration
```

### Plugin Extensibility
- Components can register custom actions without modifying CommandPalette
- Presets module can register "Load [presetName]" actions dynamically
- Layers module can register "Select [layerName]" actions

---

## 7. Storage & Persistence

### Local Storage (Current)
- Zustand persist middleware saves to localStorage
- Partialize: only `document` + `presets` are persisted (not `ui`, `viewport`, `history`)
- Auto-save on every state change

### Backend-Ready Interface (Future)
```typescript
interface EditorAPI {
  save(doc: EditorDocument): Promise<{ id: string; version: number }>;
  load(id: string): Promise<EditorDocument>;
  list(): Promise<EditorDocument[]>;
  delete(id: string): Promise<void>;
  fork(id: string): Promise<EditorDocument>;
}

// Injected implementation at runtime
let api: EditorAPI = new LocalEditorAPI(); // or RestEditorAPI, SupabaseAPI, etc.
```

---

## 8. Keyboard Shortcuts

```
Cmd+Z          → Undo
Cmd+Shift+Z    → Redo
Cmd+K          → Command Palette
Cmd+E          → Export Modal
Cmd+'          → Toggle Grid
Cmd+=          → Zoom In
Cmd+-          → Zoom Out
Delete         → Delete Selected
Cmd+D          → Duplicate Selected
Cmd+G          → Group Selected
Cmd+U          → Ungroup
```

---

## 9. Data Flow

### Creating a Node
```
UI: Click "Add Box" button
  → store.createNode("box", parentId)
  → Generate new ID
  → Create EditorNode with defaults from NODE_TYPE_DEFAULTS["box"]
  → Add to document.nodes[id]
  → Push to history
  → CanvasRenderer re-renders
  → BoxRenderer renders the new box
  → SelectionOverlay shows handles around new node
```

### Updating Node Style
```
UI: PropertyField onChange
  → store.updateNode(nodeId, { style: { ...updates } })
  → Update document.nodes[nodeId]
  → NOT yet pushed to history (caller decides frequency)
  → CanvasRenderer re-renders
  → Visual feedback immediate
User stops typing → debounced pushHistory() call
```

### Undo/Redo
```
User hits Cmd+Z
  → store.undo()
  → Pop from history.past, restore document
  → Push current document to history.future
  → CanvasRenderer re-renders with old document
```

---

## 10. Performance Optimizations (Done / Planned)

### Done
- ✓ Normalized state (O(1) node lookup)
- ✓ Zustand selectors (prevent unnecessary re-renders)
- ✓ History snapshots (deep clone, not per-property)

### Planned (P1+)
- [ ] Virtualization in LayerTree (for large layer lists)
- [ ] Memoized node selectors (useShallow for style objects)
- [ ] Efficient diff in updateNode (only re-render affected nodes)
- [ ] Canvas rendering optimization (Canvas API for very large documents)

---

## 11. Migration Strategy

### Phase 1: Hybrid Mode (Current)
- Index.tsx uses legacy GlowState (props drilling)
- Zustand store runs in parallel (not integrated)
- Allows incremental migration

### Phase 2: Schema-Driven UI (P1)
- Inspector migrates to PropertyPanel (schema-driven)
- Components subscribe to Zustand hooks
- Props drilling reduced

### Phase 3: Full Migration (P2)
- GlowState only used for backward compatibility export
- All state reads from Zustand store
- Legacy components gradually removed

---

## Summary

| Aspect | Design | Benefit |
|--------|--------|---------|
| **State** | Zustand + normalized | Centralized, efficient, testable |
| **Nodes** | EditorNode with hierarchy | Generalizable, extensible |
| **Inspector** | Schema-driven | No hardcoding, type-safe |
| **Rendering** | Multi-type renderers | Supports many node types |
| **Export** | IR pipeline | Code fidelity, multiple formats |
| **Extensibility** | Action registry | Plugin-like customization |
| **Persistence** | API abstraction | Backend-ready |

This architecture positions the editor as a professional, generalizable platform rather than a glow-specific toy.
