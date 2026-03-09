# 02 — Felhasználói Flow-k (User Flows)

---

## Flow 1: Glow effektus létrehozása és szerkesztése

| Mező | Érték |
|------|-------|
| **Flow neve** | Glow effektus létrehozása nulláról |
| **Kiindulási pont** | `/editor` oldal megnyitása (alapértelmezett 4-layer glow betöltődik) |
| **Lépések** | 1. A bal oldalsávban a "Layers" listából kiválaszt egy réteget (kattintás) → 2. A jobb oldalsávon ("Style" tab) módosítja a színt (color picker vagy quick swatch vagy harmony palette) → 3. Állítja a blur, opacity, width, height slidereket → 4. Választ blend módot (normal/screen/overlay/stb.) → 5. Opcionálisan gradient-et ad hozzá (linear/radial/conic + stop-ok) → 6. Opcionálisan animációt kapcsol be (pulse/breathe/orbit/drift/flicker/colorShift) → 7. Új réteget ad hozzá (+ gomb) vagy duplikál (CopyPlus ikon) → 8. Ismétli a 2-7 lépéseket |
| **Döntési pontok** | Gradient vs. sólid szín; animáció szükséges-e; hány réteg kell |
| **Kimenet** | Működő glow effektus a canvas-on |
| **Mi működik jól** | Az élő előnézet azonnali, a slider-ek gyorsak, a color harmony rendszer intelligens javaslatokat ad |
| **Mi gyenge** | A réteg-szerkesztés csak a jobb oldalsávon lehetséges, miközben a kiválasztás bal oldalon történik — nem optimális; nincs "Inspector" nézetváltás a canvas-on |
| **Átvinni?** | **Igen, részben** — a layer + property panel koncepció értékes, de a végső rendszerben komponens-property-kre kell átültetni |

---

## Flow 2: Réteg pozícionálás (drag-and-drop)

| Mező | Érték |
|------|-------|
| **Flow neve** | Réteg mozgatása a canvas-on |
| **Kiindulási pont** | Egy réteg kiválasztva a canvas-on |
| **Lépések** | 1. A canvas-on rákattint egy glow rétegre → 2. A réteg kiválasztódik (ring megjelenik) → 3. Fogd-és-vidd mozgatás → 4. A pozíció (x, y) valós időben frissül → 5. A floating toolbar megjelenik (duplicate/delete/visibility gombok) |
| **Döntési pontok** | Nincs |
| **Kimenet** | Réteg új pozícióba kerül |
| **Mi működik jól** | A motion/react drag natívan működik, a zoom-szinttel kompenzált mozgatás jó (delta/zoom), a floating context toolbar hasznos |
| **Mi gyenge** | Nincs snap-to-grid, nincs alignment guide, nincs multi-select |
| **Átvinni?** | **Igen** — a drag mechanika és a floating toolbar koncepció a végső canvas-editorba is kell, de snap/alignment nélkül nem production-kész |

---

## Flow 3: Preset/template betöltés

| Mező | Érték |
|------|-------|
| **Flow neve** | Beépített template betöltése |
| **Kiindulási pont** | Bal oldalsáv "Templates" szekció |
| **Lépések** | 1. Kategória kiválasztás (All/Neon/Nature/Vibrant/Minimal) → 2. Egy template kártya kattintása → 3. Az editor állapot lecserélődik a template állapotára → 4. Toast értesítés |
| **Döntési pontok** | Kategória szűrés |
| **Kimenet** | A teljes editor állapot frissül az új template-re |
| **Mi működik jól** | 16 beépített preset 4 kategóriában, mini-preview a kártyákon, gyors betöltés, toast visszajelzés |
| **Mi gyenge** | A betöltés felülírja az aktuális állapotot megerősítés nélkül; nincs "merge" opció |
| **Átvinni?** | **Igen** — a template böngésző UI + kategória rendszer értékes a végső rendszerhez |

---

## Flow 4: Felhasználói preset mentés és kezelés

| Mező | Érték |
|------|-------|
| **Flow neve** | Egyéni preset mentése és visszatöltése |
| **Kiindulási pont** | Bal oldalsáv "Save" gomb vagy ⌘S |
| **Lépések** | 1. "Save" gombra kattintás → 2. Preset név megadása → 3. Enter vagy Save gomb → 4. A preset megjelenik a "My Presets" listában → 5. Kedvencezés (csillag ikon) → 6. Visszatöltés (kattintás) → 7. Törlés (kuka ikon) → 8. Import/Export JSON fájlként |
| **Döntési pontok** | Preset név; kedvenc jelölés |
| **Kimenet** | Preset mentve localStorage-ban |
| **Mi működik jól** | Keresés preset-ek között, kedvencek kiemelése, JSON import/export |
| **Mi gyenge** | Csak localStorage — böngésző törléskor elvész; nincs felhő sync; a preset lista nehezen áttekinthető sok preset esetén |
| **Átvinni?** | **Részben** — a UI jó, de backend persistálás kell |

---

## Flow 5: Kód exportálás

| Mező | Érték |
|------|-------|
| **Flow neve** | Exportálás CSS/Tailwind/React formátumban |
| **Kiindulási pont** | "Export" gomb (bal oldalsáv) vagy Export modal |
| **Lépések** | 1. Export gombra kattintás → 2. Modal megnyílik → 3. Formátum választás (CSS / Tailwind / React) → 4. A generált kód megjelenik szintaxiskiemeléssel → 5. Copy gomb → vágólapra másolás → 6. Toast visszajelzés |
| **Döntési pontok** | Export formátum választás |
| **Kimenet** | Kód a vágólapon |
| **Mi működik jól** | 3 formátum (+ SVG a canvas-ról), a szintaxiskiemelés szép, a kód minőség jó |
| **Mi gyenge** | A szintaxiskiemelés egyszerű (regex-alapú, nem AST); a React export nem tartalmaz animáció keyframe-eket teljes mértékben |
| **Átvinni?** | **Igen** — a multi-format export pipeline és az ExportModal UI a végső rendszer egyik alappillére |

---

## Flow 6: A/B összehasonlítás

| Mező | Érték |
|------|-------|
| **Flow neve** | Aktuális és korábbi állapot összehasonlítása |
| **Kiindulási pont** | Canvas bal felső "A/B" gomb |
| **Lépések** | 1. A/B gombra kattintás → 2. Split view megnyílik (snapshot + live) → 3. Az editor módosításai a "Live Evolution" oldalon jelennek meg → 4. "Snapshot" gomb frissíti a referenciát → 5. Bezárás X gombbal |
| **Döntési pontok** | Mikor frissítsük a snapshot-ot |
| **Kimenet** | Vizuális összehasonlítás két állapot között |
| **Mi működik jól** | Elegáns UI, jó koncepció |
| **Mi gyenge** | A mini preview skálázott (0.4x), ami a finomabb effektusokat nehezen mutatja; nincs slider-alapú wipe összehasonlítás |
| **Átvinni?** | **Részben** — a koncepció értékes, de a végső rendszerben komponens-szintű diff kellene |

---

## Flow 7: Command Palette használat

| Mező | Érték |
|------|-------|
| **Flow neve** | Gyors művelet végrehajtása Command Palette-tel |
| **Kiindulási pont** | ⌘K billentyűkombináció vagy "Commands" gomb |
| **Lépések** | 1. ⌘K megnyomása → 2. Keresőmezőbe gépelés → 3. Szűrt eredmények: Actions / Layers / Presets → 4. Navigálás ↑↓ nyilakkal → 5. Enter: végrehajtás → 6. ESC: bezárás |
| **Döntési pontok** | Keresési szó |
| **Kimenet** | A kiválasztott művelet végrehajtódik |
| **Mi működik jól** | Csoportosított eredmények, billentyűzetes navigáció, shortcut megjelenítés, szép UI |
| **Mi gyenge** | Nem bővíthető plugin-rendszerrel; nincs fuzzy search |
| **Átvinni?** | **Igen, 100%** — a Command Palette a végső editor egyik kulcsfunkciója |

---

## Flow 8: Canvas nézet testreszabás

| Mező | Érték |
|------|-------|
| **Flow neve** | Viewport, zoom, grid, háttér beállítás |
| **Kiindulási pont** | Canvas felső floating toolbar |
| **Lépések** | 1. Viewport váltás: Mobile (320×400) / Tablet (500×620) / Desktop (820×520) → 2. Zoom: +/- gombok vagy Ctrl+scroll → 3. Grid toggle → 4. Dimensions/crosshair toggle → 5. Background preset váltás (8 opció: dark/light/gradient/mesh/dots/transparent) |
| **Döntési pontok** | Viewport méret, háttér típus |
| **Kimenet** | A canvas nézet módosul |
| **Mi működik jól** | A háttér preset picker elegáns, a zoom smooth, a viewport méret-váltás azonnali |
| **Mi gyenge** | A viewport méretek fixek (nem egyéni), nincs responsivity tesztelés |
| **Átvinni?** | **Igen** — a viewport/zoom/grid/bg rendszer a végső canvas-editor alapja |

---

## Flow 9: Share link generálás

| Mező | Érték |
|------|-------|
| **Flow neve** | Megosztható link létrehozása |
| **Kiindulási pont** | "Share" gomb (bal oldalsáv) |
| **Lépések** | 1. Share gombra kattintás → 2. Az editor állapot base64-be kódolva a URL hash-be kerül → 3. A URL a vágólapra másolódik → 4. Toast visszajelzés → 5. Ha valaki megnyitja a linket, az állapot betöltődik |
| **Döntési pontok** | Nincs |
| **Kimenet** | Megosztható URL a vágólapon |
| **Mi működik jól** | Egyszerű, nem kell backend |
| **Mi gyenge** | A base64 URL nagyon hosszú lehet; nem tartós (URL módosításkor elvész) |
| **Átvinni?** | **Részben** — a koncepció jó, de a végső rendszerben backend-alapú share kell |

---

## Flow 10: Rétegcsoport kezelés

| Mező | Érték |
|------|-------|
| **Flow neve** | Rétegek csoportosítása |
| **Kiindulási pont** | Bal oldalsáv "New Group" gomb (FolderPlus ikon) |
| **Lépések** | 1. Csoport létrehozása → 2. Réteg hozzárendelése csoporthoz ("Group:" gombok) → 3. Csoport opacity/blend mode beállítása → 4. Csoport összecsukása/kinyitása → 5. Csoport láthatóság ki/bekapcsolása → 6. Csoport törlése |
| **Döntési pontok** | Melyik réteg melyik csoportba |
| **Kimenet** | Szervezett réteg-hierarchia |
| **Mi működik jól** | A csoport UI intuitív, az opacity/blend öröklődés működik |
| **Mi gyenge** | Csak a LeftSidebar-ban van implementálva (a ControlPanel régebbi verziója nem tartalmazza); nincs nested csoport |
| **Átvinni?** | **Igen** — csoportosítás/hierarchia a végső editorban is kell |
