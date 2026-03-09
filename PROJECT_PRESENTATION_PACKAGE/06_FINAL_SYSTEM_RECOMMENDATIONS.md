# 06 — Végső Rendszer Javaslatok (Final System Recommendations)

---

## Átvételi összefoglaló

### 100%-ban átveendő
- **Command palette** architektúra (CommandPalette.tsx) — minimális módosítással bármilyen editorba beilleszthető
- **ErrorBoundary** — production-kész
- **useHistory hook** — generikus undo/redo
- **Color utility-k** (glow-utils.ts: hex↔HSL, paletta, harmónia generálás) — általánosan használható
- **Design tokenek** (index.css custom properties + tailwind.config.ts integráció)
- **Glass surface CSS** — érett vizuális minta
- **Keyboard shortcut pattern** — ⌘K, ⌘Z, ⌘⇧Z

### Újratervezendő
- **State management** — useState → Zustand/Jotai, normalizált state (entities by ID)
- **Canvas komponens** — a viewport/zoom/grid/bg pattern jó, de a réteg renderelést komponens renderelésre kell cserélni
- **Property panel** — a pattern jó, de dinamikus property schema kell (nem hardcoded slider-ek)
- **Preset rendszer** — a UI jó, de backend persistálás szükséges
- **Export pipeline** — a koncepció jó, de AST-alapú kódgenerálás kellene

### Eldobandó
- **ControlPanel.tsx** — duplikált kód, nincs használva
- **Landing.tsx** — glow-specifikus marketing tartalom
- **glow-presets.ts** — glow-specifikus preset adatok
- **glow-share.ts** — URL hash-alapú megosztás (backend kell)
- **~15 nem használt npm csomag** (react-query, recharts, react-hook-form, stb.)

---

## MVP vs. Advanced vs. Kísérlet

### MVP (első verzió)
1. 3-oszlopos editor layout (sidebar + canvas + property panel)
2. Canvas: viewport switching, zoom, grid
3. Property panel: dinamikus, schemá-ból generált
4. Undo/redo
5. Mentés (backend)
6. Export: CSS + React

### Advanced (második fázis)
1. Command palette (⌘K)
2. Template/preset rendszer (backend + community)
3. A/B összehasonlítás
4. Multi-format export (CSS/Tailwind/React/SVG/Flutter)
5. Layer csoportosítás/hierarchia
6. Animáció szerkesztő timeline-nal
7. Szín harmónia rendszer

### Későbbi kísérlet
1. Drag-and-drop komponens palette
2. Code ↔ Design split view
3. Real-time collaboration
4. Plugin rendszer
5. AI-alapú javaslatok
6. Responsive breakpoint szerkesztő

---

## Részletes átvételi javaslat táblázat

| Elem | Típus | Jelenlegi állapot | Érték a végső termékben | Átvételi javaslat | Prioritás | Indoklás |
|------|-------|-------------------|------------------------|--------------------|-----------|----------|
| 3-oszlopos editor layout | Architektúra | Működik, flexbox-alapú | Magas | Átvenni, resizable panel-ekkel bővíteni | P0 | Az editor alapstruktúrája |
| GlowPreview (canvas shell) | Komponens | Működik, 558 sor | Magas | Átvenni, refaktorálni (viewport/zoom/grid kiszervezés) | P0 | A vizuális szerkesztő magja |
| RightSidebar (property panel) | Komponens | Működik, 696 sor | Magas | Újratervezni dinamikus schema-ra | P0 | Property inspector a végső rendszer kulcsa |
| useHistory hook | Hook | Működik | Magas | 100% átvétel | P0 | Undo/redo alapvető funkció |
| ErrorBoundary | Komponens | Működik | Magas | 100% átvétel | P0 | Production requirement |
| Design tokenek (index.css) | Vizuális | Érett | Magas | Átvenni, bővíteni light mode-dal | P0 | Design system alapja |
| Glass surface CSS | Vizuális minta | Érett, szép | Magas | 100% átvétel | P1 | Vizuális identitás |
| CommandPalette | Komponens | Működik, 246 sor | Magas | Átvenni, action registry-vel bővíteni | P1 | Pro felhasználói élmény |
| Multi-format export | Flow | Működik (CSS/TW/React/SVG) | Magas | Átvenni, AST-alapúra fejleszteni | P1 | Az editor értékajánlatának része |
| Color utility-k | Utility | Működik | Közepes | 100% átvétel | P1 | Hasznos a szín szerkesztéshez |
| ExportModal | Komponens | Működik | Közepes | Átvenni | P1 | Export UX jó |
| LeftSidebar (shell) | Komponens | Működik, túl nagy (1091 sor) | Közepes | A pattern átvihető, refaktorálás kell | P1 | Sidebar layout minta |
| LayerManager (csoportokkal) | Komponens | Működik | Közepes | A hierarchia/csoport koncepció átvihető | P1 | Komponens fa kezelés |
| Preset rendszer UI | Komponens | Működik (localStorage) | Közepes | UI átvihető, backend kell | P2 | Template böngészés UX |
| A/B összehasonlítás | Komponens | Működik | Közepes | Koncepció átvihető | P2 | Hasznos de nem kritikus |
| usePersistedState | Hook | Működik | Közepes | Átvenni, backend-re migrálni | P2 | Lokális backup-nak jó |
| Template browser | Komponens | Működik | Alacsony | A minta átvihető, tartalom nem | P2 | Kategória szűrés UI jó |
| Animation timeline | Komponens | Alapszintű | Alacsony | Koncepció érdekes, de kiforratlan | P3 | Későbbi fejlesztés |
| Clipping mask editor | Komponens | Működik | Alacsony | Glow-specifikus | P3 | Nem prioritás |
| ControlPanel.tsx | Komponens | NEM HASZNÁLT | Nincs | **Törölni** | — | Duplikáció |
| Landing.tsx | Oldal | Működik | Nincs | **Törölni** | — | Glow-specifikus |
| glow-presets.ts (adatok) | Adat | Működik | Nincs | **Törölni** | — | Glow-specifikus |
| glow-share.ts | Utility | Működik | Nincs | **Törölni** | — | Backend kell |
| ~15 nem használt npm csomag | Függőség | Telepítve | Nincs | **Eltávolítani** | P0 | Bundle méret csökkentés |
