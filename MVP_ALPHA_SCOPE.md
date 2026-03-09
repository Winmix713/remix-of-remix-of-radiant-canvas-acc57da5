# MVP ALPHA SCOPE

## Ebben a körben készül el

### ✅ Architektúra
- Zustand store normalizált EditorNode state-tel
- EditorNode type system (effect-layer, group, box, text, button, card)
- Legacy GlowState compat layer (meglévő komponensek működnek)
- Property schema rendszer
- Shared UI komponensek (NumberInput, AnimatedSlider)

### ✅ UI/UX
- Resizable 3-panel layout (react-resizable-panels)
- Schema-driven inspector (node type → property groups)
- Product rebranding: "Canvas Studio" (glow marad mint mode)
- Component picker integration (button, card, header, hero, stb.)
- Meglévő canvas/zoom/grid/toolbar megtartása

### ✅ Cleanup
- ControlPanel.tsx törlése
- ~10 nem használt npm csomag eltávolítása
- Duplikált NumberInput/AnimatedSlider konszolidáció

### ✅ Tesztek
- Store unit tesztek (add/remove/update node, undo/redo)
- Export pipeline tesztek

## Későbbre marad

### 🔜 Fázis 2
- Canvas shell szétbontás (CanvasShell, CanvasViewport, CanvasRenderer, SelectionOverlay)
- Alignment guides + snap-to-grid
- Action registry command palette
- Design/Code/Split view
- Hierarchikus layer tree (nested groups)
- Backend-ready save model

### 🔜 Fázis 3
- AST-alapú export pipeline
- Multi-document support
- Starter templates + demo documents
- Animation timeline javítás
- Component palette drag-and-drop
- Light mode support
- Full responsive layout

### ❌ Nem cél most
- Real-time collaboration
- Plugin marketplace
- AI features
- Pixel-perfect mobil editor
- Végleges backend implementáció

## Acceptance Criteria
1. Az app MŰKÖDIK — nem törnek el meglévő funkciók
2. A state management Zustand-alapú
3. Az inspector schema-driven (legalább effect-layer típusra)
4. A layout resizable panelekkel rendelkezik
5. A ControlPanel.tsx törölve van
6. Nincs duplikált NumberInput/AnimatedSlider
7. A product branding általánosabb ("Canvas Studio")
8. Van legalább 5 unit teszt a store-ra
