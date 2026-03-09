# 00 — Projekt Áttekintés

## Projekt neve
**Glow Editor** — Vizuális CSS glow effektus szerkesztő

## Rövid leírás
Böngészőalapú, React-alapú vizuális szerkesztő, amellyel többrétegű CSS glow (fény)effektusokat lehet valós időben létrehozni, finomhangolni és exportálni. A felhasználó rétegeket (layer-eket) kezel egy drag-and-drop canvas-on, beállítja a színeket, elmosást, átlátszóságot, blend módot, gradienst és animációkat, majd a kész effektust CSS, Tailwind vagy React komponens formátumban exportálja.

## Elsődleges cél
Vizuálisan szerkeszthető CSS fényeffektusok létrehozása és exportálása — kód írása nélkül.

## Milyen problémát old meg
A CSS glow/shadow effektusok kézzel írása időigényes és nehezen iterálható. Ez az eszköz azonnali vizuális visszajelzést ad, és production-kész kódot generál.

## Rendszer típusa
**Visual effect configurator + code generator** — egy specifikus CSS tulajságcsoportra (glow/blur/gradient layerek) specializált vizuális szerkesztő, élő előnézettel és többformátumú kód exporttal.

## Miért érdekes a végső termék szempontjából
A végső termék célja egy Dreamweaver-szerű visual editor / component configurator. Ez a prototípus a következő szempontokból releváns:

1. **3-oszlopos editor layout** — bal oldali réteglista + központi canvas + jobb oldali property panel már működik
2. **Élő előnézet** — a canvas valós időben tükrözi a beállításokat, drag-and-drop pozícionálással
3. **Többformátumú kód export** — CSS / Tailwind / React / SVG export jól van megoldva
4. **Preset/template rendszer** — mentés, betöltés, keresés, import/export JSON-ból
5. **Command palette (⌘K)** — gyors művelet-kereső, ami a végső editorban is alapfunkció
6. **A/B összehasonlítás** — snapshot vs. élő állapot split view
7. **Glassmorphic dark theme** — érett, production-közeli vizuális rendszer

## Executive Summary (5-10 mondat)
A Glow Editor egy jól működő prototípus, amely CSS glow effektusok vizuális szerkesztésére specializálódik. A projekt 3-oszlopos editor elrendezést használ: bal oldalon réteglista + preset böngésző + globális vezérlők; középen élő canvas drag-and-drop layerekkel, zoom/viewport/grid/ruler támogatással; jobb oldalon property panel (szín, blur, opacity, gradient, blend mode, animáció, clipping mask). Az exportálás 4 formátumban (CSS, Tailwind, React, SVG) történik, szintaxiskiemelővel. A state management egyszerű `useState` + localStorage persistálás + custom history hook (undo/redo) alapú — nincs Redux/Zustand, ami prototípushoz elegendő, de a végső rendszerhez nem skálázódik. A vizuális rendszer érett: glassmorphic dark téma, testreszabott design tokenek, konzisztens spacing és tipográfia (JetBrains Mono + Inter). A preset rendszer a beépített template-ektől (16 preset, 4 kategória) a felhasználói presetek mentéséig, kedvencezéséig, kereséséig és JSON import/exportjáig terjed. Gyenge pontok: nincs backend, nincs felhasználói autentikáció, nincs responsivitás (csak desktop), van kódduplikáció a ControlPanel és LeftSidebar+RightSidebar között. A végső rendszer számára az editor layout, a canvas interakciók, az export pipeline, a command palette és a design token rendszer a legértékesebb elemek.
