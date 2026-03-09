# 05 — Architektúra Áttekintés (Architecture Review)

---

## Tech Stack

| Kategória | Technológia | Verzió |
|-----------|-------------|--------|
| Framework | React | ^18.3.1 |
| Build tool | Vite | ^5.4.19 |
| Nyelv | TypeScript | ^5.8.3 |
| Styling | Tailwind CSS + index.css custom properties | ^3.4.17 |
| Animáció | motion (framer-motion) | ^12.34.4 |
| UI library | shadcn/ui (Radix primitívek) | több csomag |
| Routing | react-router-dom | ^6.30.1 |
| Képexport | html-to-image | ^1.11.13 |
| Toast | sonner | ^1.7.4 |
| Teszt | vitest + @testing-library/react | ^3.2.4 |

### Telepített, de nem használt csomagok
- `@tanstack/react-query` — nincs API hívás, nincs query
- `react-hook-form` + `@hookform/resolvers` + `zod` — nincs form
- `recharts` — nincs chart
- `react-resizable-panels` — importálva sincs
- `react-day-picker`, `date-fns` — nincs dátum kezelés
- `next-themes` — nincs theme váltás
- `embla-carousel-react` — nincs carousel
- `input-otp` — nincs OTP
- `cmdk` — saját CommandPalette van, a cmdk nincs használva

**⚠️ Javaslat:** ~15 felesleges csomag eltávolítása csökkentené a bundle méretet.

---

## Mappa struktúra

```
src/
├── components/
│   ├── glow-editor/          # Fő editor komponensek (6 fájl)
│   │   ├── ABSplitView.tsx
│   │   ├── CommandPalette.tsx
│   │   ├── ControlPanel.tsx   # ⚠️ HASZNÁLATLAN — régebbi verzió
│   │   ├── GlowPreview.tsx
│   │   ├── LeftSidebar.tsx
│   │   └── RightSidebar.tsx
│   ├── ui/                    # shadcn/ui komponensek (~40 fájl)
│   ├── ErrorBoundary.tsx
│   └── NavLink.tsx
├── hooks/
│   ├── use-glow-editor.ts     # useHistory + usePresets
│   ├── use-persisted-state.ts # localStorage persist
│   ├── use-mobile.tsx
│   └── use-toast.ts
├── lib/
│   ├── glow-types.ts          # Típusok + INITIAL_STATE + exportAsCSS + debounce
│   ├── glow-utils.ts          # Szín utils + layer utils
│   ├── glow-export.ts         # Tailwind/React/SVG export
│   ├── glow-presets.ts        # 17 beépített preset
│   ├── glow-share.ts          # URL-alapú megosztás
│   └── utils.ts               # cn() helper
├── pages/
│   ├── Index.tsx              # Editor oldal
│   ├── Landing.tsx            # Marketing oldal
│   └── NotFound.tsx           # 404
├── index.css                  # Design tokenek + custom CSS
├── App.tsx                    # Router + providers
├── main.tsx                   # Entry point
└── App.css                    # (üres/minimális)
```

---

## Komponens architektúra

### Hierarchia
```
App
├── ErrorBoundary
│   ├── QueryClientProvider (nem használt)
│   │   ├── TooltipProvider
│   │   │   ├── Toasters (2x — shadcn + sonner)
│   │   │   └── BrowserRouter
│   │   │       ├── Landing
│   │   │       ├── Index (Editor)
│   │   │       │   ├── LeftSidebar
│   │   │       │   │   ├── LayerManager
│   │   │       │   │   └── TemplateBrowser
│   │   │       │   ├── GlowPreview (canvas)
│   │   │       │   ├── RightSidebar (property panel)
│   │   │       │   ├── ExportModal
│   │   │       │   ├── CommandPalette
│   │   │       │   └── ABSplitView
│   │   │       └── NotFound
```

### Kommunikáció
- **Props drilling** — az `Index.tsx` az egyetlen állapotkezelő, minden child prop-okon kapja és callback-eken módosítja az állapotot
- **Nincs context** — nincs React Context, nincs global state management
- **Nincs reducer** — egyszerű `useState` + callback-ek

---

## State Management

### Fő állapot
- `GlowState` — egyetlen nagy objektum (~15 property + nested layerek)
- `usePersistedState()` — useState + debounced localStorage persist
- **Nem normalizált** — a layerek tömb, nem Map/Record

### History (Undo/Redo)
- `useHistory()` — tömb-alapú history, max 50 state snapshot
- **Probléma:** A `debouncedHistoryPush` és a `useHistory` hook közötti interakció nem optimális — a `pushState` callback függ `currentIndex`-től, ami stale closure-t okozhat

### Preset kezelés
- `usePresets()` — localStorage-ban tárolt preset tömb
- CRUD + kedvencezés + JSON import/export

### Átmeneti állapotok
- `cssOverride` — kézi CSS szerkesztés override
- `showABSplit`, `showExportModal`, `showCommandPalette` — modal/overlay állapotok
- Canvas állapotok: `zoom`, `frameSize`, `showGrid`, `showDimensions`, stb.

---

## Styling megközelítés

1. **CSS custom properties** (index.css) — design tokenek
2. **Tailwind utility classes** — a legtöbb styling
3. **Inline styles** — canvas elemek pozíciója, mérete, színe
4. **Custom CSS classes** (index.css) — `glass-surface`, `control-section`, `swatch-circle`, `prop-label`, `canvas-toolbar`, `editor-bg`, `focus-glow`, `custom-scrollbar`
5. **`cn()` helper** — clsx + tailwind-merge

---

## Adatfolyam

```
User Interaction
    ↓
Event handler (LeftSidebar/RightSidebar/GlowPreview)
    ↓
Callback → Index.tsx handleStateChange()
    ↓
setCurrentState() (useState update)
    ↓ (useEffect)
localStorage persist (debounced 300ms)
    ↓ (useMemo)
CSS generation (exportAsCSS)
    ↓
<style> tag injection (dangerouslySetInnerHTML)
    ↓
Canvas re-render (GlowPreview)
```

---

## Teljesítmény szempontok

### Pozitívumok
- `useMemo` és `useCallback` ahol szükséges
- Debounced history push (500ms)
- Debounced localStorage save (300ms)
- `AnimatePresence` layout animációkkal

### Problémák
- **Teljes state újrarenderelés** — bármely property változás az egész editor-t újrarendereli (nincs selector-alapú optimalizáció)
- **CSS újragenerálás** — minden state változáskor a teljes CSS újragenerálódik és beinjektálódik
- **Inline keyframe generálás** — az animáció keyframe-ek a renderben generálódnak string template-ként
- **Sok nagy fájl** — LeftSidebar (1091 sor), ControlPanel (830 sor), RightSidebar (696 sor), GlowPreview (558 sor) — nehezen karbantarthatóak

---

## Karbantarthatóság

| Aspektus | Értékelés | Részletek |
|----------|-----------|-----------|
| Típusbiztonság | ★★★★☆ | Jó TypeScript típusok, de `any` használat a PresetManagerUI-ban |
| Kódduplikáció | ★★☆☆☆ | ControlPanel vs LeftSidebar+RightSidebar teljes duplikáció; NumberInput, AnimatedSlider, stb. 3x implementálva |
| Fájlméret | ★★☆☆☆ | Túl nagy fájlok, nincs kellő szétbontás |
| Tesztek | ★☆☆☆☆ | Egyetlen placeholder teszt (`example.test.ts`) |
| Dokumentáció | ★★☆☆☆ | Néhány JSDoc komment, de nincs átfogó |

---

## Skálázhatóság

| Aspektus | Értékelés | Probléma |
|----------|-----------|----------|
| State management | ★★☆☆☆ | useState nem skálázódik — Zustand/Jotai kellene |
| Komponens méret | ★★☆☆☆ | Monolitikus komponensek — szétbontás szükséges |
| Plugin rendszer | ★☆☆☆☆ | Nincs bővíthetőség |
| Multi-entity support | ★☆☆☆☆ | Egyetlen effektus szerkesztése — nincs multi-document |
| Backend | ★☆☆☆☆ | Nincs — minden localStorage |

---

## Értékelés: Prototípus vs. Production

### Prototípus jellegű elemek
- localStorage-alapú persistálás
- URL hash-alapú megosztás
- useState-alapú state management
- ControlPanel.tsx duplikáció
- Inline `<style>` injektálás
- Hardcoded viewport méretek
- Nincs tesztelés
- Nincs error handling az export-ban
- Nincs responsivitás (csak desktop)

### Production-közeli elemek
- Design token rendszer (index.css)
- Glass surface CSS
- Típusdefiníciók (GlowState, GlowLayer, stb.)
- Multi-format export pipeline
- Command palette
- Color harmony utility-k
- ErrorBoundary
- Keyboard shortcut kezelés

### A végső rendszerbe menthető elemek
1. **3-oszlopos editor layout** minta
2. **Canvas komponens** (viewport/zoom/grid/ruler/bg picker)
3. **Property panel pattern** (tab-ok + csoportosított beállítások)
4. **Command palette** architektúra
5. **Multi-format export** pipeline
6. **Design token rendszer** és glass surface CSS
7. **useHistory** hook (undo/redo)
8. **Color utility-k** (harmony, palette)
9. **Preset rendszer** UI pattern
10. **A/B összehasonlítás** koncepció
