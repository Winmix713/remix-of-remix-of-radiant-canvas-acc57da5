# 08 — Demo Script (5-10 perces bemutató)

---

## Bevezető (30 mp)

> „Ez a Glow Editor — egy vizuális CSS glow effektus szerkesztő prototípus. A végső célunk egy Dreamweaver-szerű visual editor React komponensekhez. Ez a prototípus az editor alapmechanikáit validálja: 3-oszlopos layout, élő canvas, property panel, export és gyors navigáció."

---

## 1. Landing Page áttekintés (30 mp)

**Nyisd meg:** `/`

> „A landing page egyszerű marketing oldal. Ami itt fontos: a `glass-surface` CSS minta és a motion/react animációk. Ezek a végső rendszerben is használhatóak."

**Kattints:** „Launch Editor"

---

## 2. Editor layout bemutatás (1 perc)

**Nézet:** `/editor` — teljes 3-oszlopos layout

> „Az editor 3 oszlopból áll:
> - **Bal oldal:** réteglista, preset-ek, globális vezérlők, gyorsműveletek
> - **Közép:** élő canvas — viewport váltás, zoom, grid, háttér választó
> - **Jobb oldal:** property panel — a kiválasztott réteg szín, blur, opacity, gradient, animáció beállításai
>
> Ez a layout 1:1-ben megfelelhet a végső visual editor alapstruktúrájának."

---

## 3. Canvas interakciók (1.5 perc)

**Mutasd be:**
1. **Viewport váltás** — kattints a Mobile / Tablet / Desktop ikonokra
2. **Zoom** — Ctrl+scroll vagy +/- gombok, reset gombbal
3. **Grid toggle** — Grid ikon a toolbar-on
4. **Background picker** — Image ikon → 8 háttér preset (dark, light, sunset, ocean, aurora, mesh, dots, transparent)
5. **Layer drag** — fogj meg egy glow réteget és mozgasd
6. **Floating toolbar** — kattints egy rétegre → a lebegő toolbar megjelenik (duplicate, delete, visibility)

> „A canvas a végső rendszer alapja. A viewport switcher, zoom, grid és háttér picker mind újrahasználható. A drag-and-drop layer mechanika a végső rendszerben komponens pozícionálásra lesz."

---

## 4. Property panel (RightSidebar) (1.5 perc)

**Válassz ki egy réteget, majd mutasd:**
1. **Style tab:**
   - Smart Suggestions bento (Boost Glow, Harmonize)
   - Color picker + Quick swatches (7 szín)
   - Color Harmony panel (Complementary, Analogous, Triadic, Split Comp.)
   - Blur, Opacity, Width, Height sliderek
   - Blend mode selector
   - Gradient editor (linear/radial/conic + angle + color stops + preview)
   - Per-layer animation (pulse/breathe/orbit/drift/flicker/colorShift + duration + delay)
   - Clipping mask (kép feltöltés + fit mode)

2. **Global tab:**
   - Master Scale, Master Opacity, Noise on/off + intensity
   - Global animation (breathe + duration)

3. **Code tab:**
   - Élő CSS kód szintaxiskiemeléssel
   - Kézi szerkesztési lehetőség

> „A property panel mintája — tab-ok + bento kártyák + sliderek — a végső rendszer component inspector-ának alapja lesz. A szín harmónia rendszer különösen értékes."

---

## 5. Preset rendszer (1 perc)

**Mutasd be:**
1. **Templates** — bal oldalsáv, kategória szűrés (Neon / Nature / Vibrant / Minimal), kattints egy template-re
2. **Save preset** — Save gomb → név megadás → elmentve
3. **My Presets** — collapsible lista, kedvencezés, keresés, JSON export/import

> „16 beépített template 4 kategóriában, plusz felhasználói preset-ek mentése, kedvencezése, keresése és JSON exportja. A minta a végső rendszer template rendszeréhez használható."

---

## 6. Export (1 perc)

**Kattints:** Export gomb → Export Modal megnyílik

1. **CSS tab** — nyers CSS a glow effektussal
2. **Tailwind tab** — JSX + Tailwind osztályok
3. **React tab** — teljes React komponens

**Kattints:** Copy gomb → „CSS copied!" toast

> „A multi-format export a végső rendszer egyik kulcsfunkciója. A jelenlegi implementáció string template-alapú — a végső rendszerben AST-alapú kódgenerálás kellene, de a felhasználói élmény és a modal UI jó."

---

## 7. Command Palette (30 mp)

**Nyomd meg:** ⌘K

> „A Command Palette a profik eszköze. Kereshetsz műveleteket, rétegeket, preset-eket. Nyilakkal navigálsz, Enter-rel végrehajtod. Ez a végső rendszerben is alapfunkció lesz."

**Gépelj:** „fire" → válaszd ki a „Fire Blaze" preset-et → betöltődik

---

## 8. A/B összehasonlítás (30 mp)

**Kattints:** A/B gomb (bal felső, SplitSquareHorizontal ikon)

> „Az A/B Engine snapshot-ot készít az aktuális állapotról, majd az élő változtatásokat mellette mutatja. Hasznos az iterációhoz."

**Módosíts:** változtasd meg egy réteg színét → a bal (snapshot) és jobb (live) oldal különbözik

---

## 9. Technikai kiemelések (1 perc)

> „Amit érdemes megjegyezni a végső rendszer szempontjából:
>
> 1. A design token rendszer érett — HSL-alapú CSS variables, glass surface, shadow skála
> 2. A useHistory hook generikus undo/redo — bármire használható
> 3. A szín utility-k (harmony, palette generálás) általánosan értékesek
> 4. A keyboard shortcut pattern (⌘K, ⌘Z) jó alap
>
> Ami gyenge és újratervezendő:
> 1. State management: useState nem skálázódik — Zustand kell
> 2. Nincs responsivitás — csak desktop
> 3. Van kódduplikáció (ControlPanel.tsx nem használt)
> 4. Nincs backend — minden localStorage-ban van"

---

## Zárás (30 mp)

> „Összefoglalva: ez a prototípus validálja az editor alapmechanikákat — 3-oszlopos layout, élő canvas, property panel, export, command palette. A végső rendszerbe a layout, a canvas interakciók, a property panel pattern, a command palette és a design token rendszer vihető át. Az állapotkezelés, a backend és a responsivitás újratervezést igényel."
