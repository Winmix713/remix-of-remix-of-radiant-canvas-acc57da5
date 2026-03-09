# UPGRADE PLAN — Glow Editor → Canvas Studio Alpha

## Alpha status update
- `/editor` now routes to `src/pages/Editor.tsx`; `Index.tsx` is explicitly deprecated but retained for parity validation.
- Zustand is the active source of truth for document, viewport, UI flags, history, presets, and demo document loading.
- A `glow-compat` adapter bridges normalized `EditorDocument` data to legacy preview/export flows.
- Undo/redo now records snapshots before document mutation to avoid history drift.
- The right inspector is now schema-driven for `effect-layer` nodes and uses shared inputs.
- Export generation now flows through an intermediate representation before formatter output.
- Three demo documents are seeded in-store: Neon Glow, Landing Hero, and Card Component.

## Jelenlegi problémák
1. **useState + props drilling** — nem skálázódik, stale closure kockázat
2. **Glow-specifikus renderelés** — nem általánosítható
3. **Hardcoded inspector** — nem bővíthető más node típusokra
4. **Monolitikus fájlok** — LeftSidebar 1091 sor, RightSidebar 696 sor
5. **Duplikált komponensek** — NumberInput, AnimatedSlider 3x implementálva
6. **ControlPanel.tsx** — 830 sor nem használt duplikáció
7. **~15 nem használt npm csomag**
8. **localStorage-függő** — nincs backend-ready absztrakció
9. **String-template export** — nem AST-alapú kódgenerálás
10. **Nincs responsivitás, tesztelés, multi-document**

## Célarchitektúra
- **Zustand store** normalizált state-tel (entities by ID)
- **EditorNode** generikus node rendszer (effect-layer, box, text, button, card, stb.)
- **Schema-driven inspector** — node type határozza meg a property groupokat
- **Resizable 3-panel layout** — react-resizable-panels
- **Export pipeline** — intermediate representation réteg
- **Action registry** — bővíthető command palette
- **Backend-ready** — save/load interfész absztrakció

## Fejlesztési fázisok

### Fázis 1 — Alapok (P0)
- Zustand store + normalizált state
- EditorNode type system
- Shared komponensek (NumberInput, AnimatedSlider)
- Resizable panel layout
- ControlPanel törlése + package cleanup
- Product rebranding (Canvas Studio)

### Fázis 2 — Inspector + Canvas (P1)
- Schema-driven property panel
- Canvas shell szétbontás
- Action registry command palette
- Selection overlay + alignment guides
- Hierarchikus layer tree

### Fázis 3 — Export + Productizálás (P2)
- Intermediate representation export
- Design/Code/Split view
- Starter templates + demo documents
- Backend-ready save model
- Smoke + unit tesztek

## Kockázatok
- **Regresszió**: A meglévő UX eltörhet a refaktor során → legacy compat layer szükséges
- **Scope creep**: Túl sok feature egyszerre → strict prioritizálás
- **Teljesítmény**: Normalizált state + selectorok kellenek a re-render optimalizáláshoz

## Döntések
1. **Zustand** (nem Jotai) — egyszerűbb API, selector-barát, middleware support
2. **Normalizált state** — `Record<string, EditorNode>` O(1) lookup
3. **Legacy compat** — `toLegacyGlowState()` selector a meglévő komponensekhez
4. **Inkrementális migráció** — nem teljes újraírás, hanem fokozatos átállás
