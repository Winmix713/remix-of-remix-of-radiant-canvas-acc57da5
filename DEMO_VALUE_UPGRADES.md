# DEMO VALUE UPGRADES

## Milyen változtatásoktól lesz meggyőzőbb az app

### 1. Resizable Panelek
A fix szélességű 3-oszlopos layout helyett húzható panel szélességek. Ez azonnal professzionális editor érzetet ad (VS Code, Figma analógia).

### 2. Product Rebranding
"GLOW Editor" → "Canvas Studio". A glow marad mint demo use-case / effect mode, de a felhasználói felület egy általános visual editor benyomását kelti.

### 3. Component Picker
A LeftSidebar-ban már van component picker (button, card, header, hero, stb.). Ezt prominensebben kell megjeleníteni — ez mutatja, hogy nem csak glow, hanem komponens-szerkesztő.

### 4. Schema-Driven Inspector
A hardcoded slider-ek helyett dinamikus property panel, ami a kiválasztott node típus alapján mutat mezőket. Ez technikailag hitelesebbé teszi az architektúrát.

### 5. Zustand Store
A useState + props drilling helyett centralizált, selector-optimalizált store. Ez a kód review-nál azonnal hitelesebb.

## 3 Demo State

### Demo 1: "Neon Glow Effect"
Az eredeti glow editor use-case. 4 effect-layer, animáció, gradient. Mutatja, hogy a glow továbbra is tökéletesen működik.

### Demo 2: "Landing Hero Section"
Egy egyszerű hero layout: container + heading text + button + background glow. Mutatja a multi-type node rendszert.

### Demo 3: "Card Component"
Egy card komponens: container + image placeholder + text + button. Mutatja a komponens-szerkesztő víziót.

## Bemutatási Flow

1. **Indítás**: Canvas Studio nyílik, "Neon Glow" demo betöltve
2. **Panel resize**: Húzd a panel széleket — professzionális editor
3. **Component picker**: Válts "Card" komponensre — nem csak glow
4. **Inspector**: Nézd a dinamikus property panelt — node típus alapú
5. **Export**: Exportáld React komponensként — clean, használható kód
6. **⌘K**: Command palette — pro workflow
7. **Undo/Redo**: ⌘Z/⌘⇧Z — működik a store-ral

## Screenshotok
1. Resizable panel layout teljes nézetben
2. Component picker grid (8 típus)
3. Schema-driven inspector effect-layer-rel
4. Export modal React kóddal
5. Command palette nyitva
