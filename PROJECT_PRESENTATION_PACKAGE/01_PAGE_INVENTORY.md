# 01 — Oldal Leltár (Page Inventory)

## 1. Landing Page

| Mező | Érték |
|------|-------|
| **Route** | `/` |
| **Fájl** | `src/pages/Landing.tsx` |
| **Cél** | Marketing/bemutató oldal, amely az editorra navigál |
| **Fő UI blokkok** | Navbar (logó + CTA gomb), Hero szekció (cím, leírás, 2 CTA gomb, háttér glow dekoráció), Feature grid (6 kártya: Multi-Layer, Color Intelligence, Export, Live Preview, Presets, Animations), CTA szekció (glass kártya), Footer |
| **Legfontosabb interakciók** | "Open Editor" / "Launch Editor" gombok → `/editor` navigáció; "View Templates" → szintén `/editor` |
| **Kezelt adatok** | Nincs dinamikus adat, teljesen statikus |
| **Végső rendszer relevanciája** | **Alacsony** — a végső terméknek saját landing/marketing oldala lesz; ez a tartalom glow-specifikus |
| **Újrahasznosítási érték** | **Alacsony** — A layout és motion animációk (stagger, spring) tanulságosak, de a tartalom nem releváns |

### Megjegyzések
- A feature kártyák `glass-surface` CSS osztályt használnak — ez a vizuális minta átvihető
- A motion/react animációk (container + item stagger pattern) jó minta
- A GitHub link jelenleg `https://github.com`-ra mutat (placeholder)

---

## 2. Editor (fő munkafelület)

| Mező | Érték |
|------|-------|
| **Route** | `/editor` |
| **Fájl** | `src/pages/Index.tsx` |
| **Cél** | A glow effektus szerkesztő teljes munkafelülete |
| **Fő UI blokkok** | LeftSidebar (réteglista, preset-ek, globális vezérlők, toolbar), Center Canvas (GlowPreview: viewport switcher, zoom, grid, ruler, background picker, drag-and-drop layerek, timeline, status bar), RightSidebar (property panel: Style/Global/Code tab-ok), ExportModal (modális CSS/Tailwind/React export), CommandPalette (⌘K keresős gyors-parancs lista), ABSplitView (A/B összehasonlító) |
| **Legfontosabb interakciók** | Layer kiválasztás (kattintás canvas-on vagy listán), Layer drag (pozíció módosítás), Property szerkesztés (szín, blur, opacity, méret, blend, gradient, animáció, clip mask), Viewport váltás (mobile/tablet/desktop), Zoom (ctrl+scroll, gombok), Grid/ruler/dimension toggle, Background preset váltás, Preset mentés/betöltés/keresés/kedvencezés, Template böngészés/betöltés, Export (4 formátum + copy), Share link generálás, Undo/Redo (⌘Z/⌘⇧Z), Randomize, A/B split nyitás/zárás, Command palette (⌘K) |
| **Kezelt adatok** | `GlowState` (teljes editor állapot: layerek, globális beállítások, animáció, csoportok, stílus vágólap), localStorage-ban persistálva |
| **Végső rendszer relevanciája** | **Magas** — ez a projekt magja; a layout, canvas, property panel, export, command palette mind releváns a végső visual editorhoz |
| **Újrahasznosítási érték** | **Magas** |

### Megjegyzések
- Az editor oldal `<style dangerouslySetInnerHTML>` -t használ a CSS injektáláshoz — ez prototípus-megoldás, de a koncepció (élő CSS generálás + injektálás) értékes
- A 3-oszlopos layout flexbox alapú, nincs resizable panel (react-resizable-panels telepítve van, de nincs használva)
- A keyboard shortcut kezelés az Index.tsx-ben van, nem dedikált hook-ban

---

## 3. NotFound (404)

| Mező | Érték |
|------|-------|
| **Route** | `*` (catch-all) |
| **Fájl** | `src/pages/NotFound.tsx` |
| **Cél** | 404 hibaoldal |
| **Fő UI blokkok** | Központi kártya: "404" cím, leírás, link a főoldalra |
| **Legfontosabb interakciók** | Visszanavigálás a `/`-re |
| **Kezelt adatok** | Nincs |
| **Végső rendszer relevanciája** | **Alacsony** — standard 404 oldal |
| **Újrahasznosítási érték** | **Alacsony** |

---

## Összefoglaló

| Oldal | Route | Újrahasznosítási érték |
|-------|-------|----------------------|
| Landing | `/` | Alacsony |
| Editor | `/editor` | **Magas** |
| NotFound | `*` | Alacsony |

Az alkalmazás lényegében **egyoldalas** — az editor az egyetlen érdemi felület.
