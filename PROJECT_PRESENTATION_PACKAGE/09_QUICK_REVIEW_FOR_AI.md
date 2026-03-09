# 09 — Gyors AI Áttekintés (Quick Review for AI)

---

## Mi ez a projekt?
Böngészőalapú vizuális CSS glow effektus szerkesztő (React + Vite + TypeScript + Tailwind). Többrétegű fényeffektusok drag-and-drop szerkesztése, valós idejű előnézet, 4 formátumú kód export. Egy nagyobb visual editor / component configurator rendszer prototípusa.

## Legfontosabb oldalak
1. **`/editor` (Index.tsx)** — A teljes szerkesztő, 3-oszlopos layout: LeftSidebar (rétegek, preset-ek) + Canvas (GlowPreview: viewport/zoom/grid/drag) + RightSidebar (property panel: szín/blur/opacity/gradient/animáció/code)
2. **`/` (Landing.tsx)** — Marketing landing page (nem releváns a végső rendszerhez)
3. **`*` (NotFound.tsx)** — 404 oldal

## Legfontosabb komponensek
1. **GlowPreview** (558 sor) — Canvas: viewport switching (mobile/tablet/desktop), zoom (0.25x–3x), grid/ruler/crosshair, 8 háttér preset, drag-and-drop réteg pozícionálás, PNG/SVG export, floating layer toolbar, animation timeline
2. **LeftSidebar** (1091 sor) — Réteglista (drag reorder, csoportok, stílus másolás), template böngésző (17 preset, 4 kategória), preset mentés/keresés/kedvencezés/JSON export, globális vezérlők, toolbar (undo/redo/save/share/export/randomize/⌘K)
3. **RightSidebar** (696 sor) — Property panel: Style tab (szín picker, harmony, quick swatch, sliders, blend mode, gradient editor, per-layer animation, clipping mask), Global tab (scale/opacity/noise/animation), Code tab (élő CSS + kézi szerkesztés)
4. **CommandPalette** (246 sor) — ⌘K gyors-parancs kereső: actions, layers, presets; billentyűzetes navigáció; csoportosított eredmények
5. **ExportModal** — CSS/Tailwind/React formátum váltó, szintaxiskiemelés, copy
6. **ABSplitView** — Snapshot vs. élő állapot összehasonlítás
7. **ControlPanel** (830 sor) — ⚠️ NEM HASZNÁLT, duplikált régebbi kód

## Legfontosabb flow-k
1. Layer kiválasztás → property szerkesztés → élő előnézet
2. Template betöltés (16 beépített, kategória szűrés)
3. Preset mentés/betöltés/keresés/kedvencezés (localStorage)
4. Export: CSS / Tailwind / React / SVG
5. Canvas: viewport váltás, zoom, grid, bg picker, drag pozícionálás
6. Command palette: ⌘K keresés + végrehajtás
7. A/B összehasonlítás
8. Share link generálás (URL hash, base64)
9. Undo/redo (⌘Z/⌘⇧Z, 50 lépés history)
10. Randomize (véletlenszerű glow generálás)

## Top 10 újrafelhasználható ötlet
1. 3-oszlopos editor layout (sidebar + canvas + inspector)
2. Canvas viewport switching + zoom + grid overlay
3. Command palette (⌘K) architektúra
4. Multi-format kód export pipeline (CSS/Tailwind/React/SVG)
5. Property panel bento card pattern (csoportosított szerkesztők)
6. Color harmony rendszer (complementary/analogous/triadic/split)
7. Design token rendszer (HSL CSS variables + Tailwind integráció)
8. Glass surface CSS minta (backdrop-blur + gradient + border)
9. useHistory hook (generikus undo/redo)
10. Template böngésző kategória szűréssel

## Top 10 probléma
1. **ControlPanel.tsx duplikáció** — 830 soros nem használt fájl, a LeftSidebar + RightSidebar duplikátuma
2. **useState-alapú state management** — nem skálázódik, stale closure kockázat a history hook-ban
3. **~15 nem használt npm csomag** — react-query, recharts, react-hook-form, zod, cmdk, stb.
4. **Nincs responsivitás** — csak desktop, mobil nem kezelt
5. **Nincs tesztelés** — egyetlen placeholder teszt
6. **Monolitikus fájlok** — LeftSidebar 1091 sor, ControlPanel 830 sor
7. **LeftSidebar `GLOW` hardcoded szín** — eltér a CSS `--primary` tokentől
8. **Nincs backend** — minden localStorage-ban, nincs felhasználó kezelés
9. **Inline style injektálás** — `dangerouslySetInnerHTML` a CSS-hez
10. **NumberInput/AnimatedSlider 3x implementálva** — LeftSidebar, RightSidebar, ControlPanel mindháromban

## Top 5 MVP-be való elem
1. 3-oszlopos editor layout + resizable panelek
2. Canvas: viewport + zoom + grid + drag
3. Property panel: dinamikus, schema-alapú property inspector
4. Undo/redo (useHistory)
5. Export: CSS + React kódgenerálás

## Top 5 prémium / advanced elem
1. Command palette (⌘K) bővíthető action registry-vel
2. Template/preset rendszer backend-del + community sharing
3. A/B összehasonlítás split view
4. Animáció szerkesztő timeline-nal
5. Color harmony + intelligens szín javaslatok
