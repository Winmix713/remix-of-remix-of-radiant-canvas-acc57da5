# 03 — Komponens Leltár (Component Inventory)

---

## Fő alkalmazás-specifikus komponensek

### 1. GlowPreview
| Mező | Érték |
|------|-------|
| **Fájl** | `src/components/glow-editor/GlowPreview.tsx` (558 sor) |
| **Típus** | Canvas / Preview |
| **Hol használva** | `Index.tsx` |
| **Props** | `state: GlowState`, `setPower`, `onStateChange`, `onLayerSelect`, `cssOverride` |
| **State-ek** | `showGrid`, `showDimensions`, `showRulers`, `showBgPicker`, `showTimeline`, `frameSize`, `isExporting`, `zoom`, `hoveredLayer` |
| **Variánsok** | 3 viewport méret (mobile/tablet/desktop), 8 háttér preset |
| **Függőségek** | motion/react, html-to-image, lucide-react, glow-types, glow-export |
| **Reusability score** | **7/10** — a canvas/viewport/zoom/toolbar mechanika általánosítható |
| **Ajánlás** | **Igen, átdolgozással** — a viewport switcher, zoom, grid, toolbar pattern értékes; a glow-specifikus réteg renderelést le kell cserélni komponens renderelésre |

**Belső alkomponensek:**
- `ToolBtn` — kis ikonos gomb a toolbar-ban
- `CanvasRulers` — pixeles vonalzók
- `getLayerAnimationStyle()` / `generateLayerKeyframes()` — animáció CSS generátor

---

### 2. LeftSidebar
| Mező | Érték |
|------|-------|
| **Fájl** | `src/components/glow-editor/LeftSidebar.tsx` (1091 sor) |
| **Típus** | Sidebar / Panel |
| **Hol használva** | `Index.tsx` |
| **Props** | `state`, `onStateChange`, `onUndo/Redo`, `canUndo/Redo`, `onSavePreset`, `presetManager`, `onOpenExport`, `onShare`, `onOpenCommandPalette` |
| **State-ek** | Belső: szekciók collapse állapota, preset név input, keresés |
| **Függőségek** | motion/react, lucide-react, shadcn (Switch, Select, Collapsible), glow-types, glow-presets, glow-utils |
| **Reusability score** | **6/10** — a sidebar shell és szekció-rendszer általánosítható, de a tartalom glow-specifikus |
| **Ajánlás** | **Részben** — a sidebar layout, collapsible szekciók, toolbar minta átvihető |

**Belső alkomponensek (LeftSidebar):**
- `LayerManager` — réteglista drag-and-drop-pal, csoportokkal, stílus másolás/beillesztéssel
- `TemplateBrowser` — beépített template böngésző kategória szűréssel
- `MiniPresetPreview` — kis preview a preset kártyákon

---

### 3. RightSidebar
| Mező | Érték |
|------|-------|
| **Fájl** | `src/components/glow-editor/RightSidebar.tsx` (696 sor) |
| **Típus** | Property panel / Inspector |
| **Hol használva** | `Index.tsx` |
| **Props** | `state`, `onStateChange`, `cssOverride`, `setCssOverride` |
| **State-ek** | `activeTab` (style/global/code), clip mask input ref |
| **Függőségek** | motion/react, lucide-react, shadcn (Slider, Switch, Select), glow-types, glow-export, glow-utils |
| **Reusability score** | **7/10** — a property panel pattern (tab-ok, slider-ek, szín picker, blend mode, export code view) nagyon értékes |
| **Ajánlás** | **Igen, átdolgozással** — a végső rendszer property inspector-ának alapja lehet |

**Belső alkomponensek (RightSidebar):**
- `NumberInput` — szám beviteli mező egységgel
- `AnimatedSlider` — motion-wrappelt Slider
- `ColorSwatchRow` — gyors szín választó
- `ColorHarmonyPanel` — szín harmónia javaslatok (complementary/analogous/triadic/split-comp)
- `SyntaxHighlightedCode` — egyszerű szintaxiskiemelő
- `ExportModal` — export modális (CSS/Tailwind/React)

---

### 4. ControlPanel (RÉGEBBI VERZIÓ)
| Mező | Érték |
|------|-------|
| **Fájl** | `src/components/glow-editor/ControlPanel.tsx` (830 sor) |
| **Típus** | Egyesített vezérlőpanel (régebbi) |
| **Hol használva** | **SEHOL** — nincs importálva és nincs használva semmilyen fájlban |
| **Reusability score** | **2/10** — duplikált kód a LeftSidebar + RightSidebar-ral |
| **Ajánlás** | **Nem** — eldobandó, a LeftSidebar + RightSidebar a frissebb, jobb implementáció |

**⚠️ FONTOS:** A ControlPanel.tsx 830 soros fájl, amely a LeftSidebar és RightSidebar funkcióinak korábbi, egypaneles változata. Tartalmaz saját `ExportModal`, `LayerManager`, `TemplateBrowser`, `NumberInput`, `AnimatedSlider`, `ColorPalettePanel`, stb. implementációkat. **Törlendő a duplikáció elkerülése érdekében.**

---

### 5. CommandPalette
| Mező | Érték |
|------|-------|
| **Fájl** | `src/components/glow-editor/CommandPalette.tsx` (246 sor) |
| **Típus** | Overlay / Command palette |
| **Hol használva** | `Index.tsx` |
| **Props** | `isOpen`, `onClose`, `state`, `onStateChange`, `onUndo/Redo`, `onExport`, `onShare`, `onRandomize` |
| **State-ek** | `query`, `selectedIndex` |
| **Függőségek** | motion/react, lucide-react, glow-types, glow-presets |
| **Reusability score** | **9/10** — minimális módosítással bármilyen editorba beilleszthető |
| **Ajánlás** | **Igen, 100%** — a végső rendszer egyik kulcskomponense |

---

### 6. ABSplitView + ABSplitToggle
| Mező | Érték |
|------|-------|
| **Fájl** | `src/components/glow-editor/ABSplitView.tsx` (152 sor) |
| **Típus** | Összehasonlító nézet |
| **Hol használva** | `Index.tsx` |
| **Props** | `currentState`, `onClose` / `isOpen`, `onToggle` |
| **State-ek** | `snapshotState`, `locked` |
| **Reusability score** | **6/10** — a koncepció jó, de a GlowMiniPreview glow-specifikus |
| **Ajánlás** | **Részben** — az A/B pattern értékes, a preview-t kell lecserélni |

---

### 7. ErrorBoundary
| Mező | Érték |
|------|-------|
| **Fájl** | `src/components/ErrorBoundary.tsx` (63 sor) |
| **Típus** | Error handler |
| **Hol használva** | `App.tsx` (wrappeli az egész appot) |
| **Reusability score** | **10/10** |
| **Ajánlás** | **Igen** |

---

### 8. NavLink
| Mező | Érték |
|------|-------|
| **Fájl** | `src/components/NavLink.tsx` (28 sor) |
| **Típus** | Navigációs link wrapper |
| **Hol használva** | Nincs aktív használat |
| **Reusability score** | **8/10** |
| **Ajánlás** | **Igen** |

---

## Hooks

### useHistory
| Mező | Érték |
|------|-------|
| **Fájl** | `src/hooks/use-glow-editor.ts` |
| **Típus** | Undo/redo history manager |
| **Reusability score** | **9/10** — generikus, bármilyen állapotra használható |
| **Ajánlás** | **Igen** |

### usePresets
| Mező | Érték |
|------|-------|
| **Fájl** | `src/hooks/use-glow-editor.ts` |
| **Típus** | Preset CRUD (localStorage) |
| **Reusability score** | **7/10** — a logika jó, de localStorage-specifikus |
| **Ajánlás** | **Részben** — backend-re kell migrálni |

### usePersistedState
| Mező | Érték |
|------|-------|
| **Fájl** | `src/hooks/use-persisted-state.ts` |
| **Típus** | localStorage auto-save |
| **Reusability score** | **8/10** — generikus debounced persist hook |
| **Ajánlás** | **Igen** |

---

## Utility modulok

### glow-types.ts
- Típusdefiníciók + `INITIAL_STATE` + `exportAsCSS()` + `debounce()`
- **Ajánlás:** A típus-rendszer jó alap, de a `exportAsCSS` logikát külön fájlba kellene tenni (részben már van `glow-export.ts`)

### glow-utils.ts
- Szín segédfüggvények (hex↔HSL konverzió, paletta generálás, harmóniák)
- Layer segédfüggvények (duplicate, random glow generálás)
- **Ajánlás:** A color utility-k értékesek és általánosak

### glow-export.ts
- `exportAsTailwind()`, `exportAsReactComponent()`, `exportAsSVG()`, `exportForFormat()`
- **Ajánlás:** A multi-format export pattern nagyon értékes

### glow-presets.ts
- 16 beépített preset 4 kategóriában
- **Ajánlás:** Glow-specifikus, de a preset struktúra mint minta átvihető

### glow-share.ts
- URL hash alapú állapot megosztás (base64)
- **Ajánlás:** Átmeneti megoldás, a végső rendszerben backend-alapú share kell

---

## Kategorizált lista

### Core Building Blocks (általános)
- `ErrorBoundary`
- `NavLink`
- `useHistory` hook
- `usePersistedState` hook
- `debounce()` utility
- Color utilities (hex↔HSL, paletta, harmóniák)

### Editor-specific komponensek
- `LeftSidebar` (shell + szekció rendszer)
- `RightSidebar` (property panel pattern)
- `CommandPalette`
- `ABSplitView`

### Inspector / Property Panel komponensek
- `NumberInput`
- `AnimatedSlider`
- `ColorSwatchRow`
- `ColorHarmonyPanel`
- Blend mode selector
- Gradient editor (stop-ok + angle + preview)
- Animation editor (type + duration + delay)
- Clipping mask editor

### Layout / Canvas komponensek
- `GlowPreview` (canvas shell: viewport, zoom, grid, ruler, bg picker)
- `ToolBtn` (canvas toolbar gomb)
- `CanvasRulers`
- `GlowMiniPreview` (skálázott mini preview)

### Export / Code View komponensek
- `ExportModal`
- `SyntaxHighlightedCode`
- `exportAsCSS`, `exportAsTailwind`, `exportAsReactComponent`, `exportAsSVG`
