# REFACTOR TODO — Fájlszintű teendők

## TÖRÖLNI
- [x] `src/components/glow-editor/ControlPanel.tsx` — 830 sor duplikált, nem használt kód

## ELTÁVOLÍTANDÓ NPM CSOMAGOK
- `@tanstack/react-query` — nincs API hívás
- `react-hook-form`, `@hookform/resolvers` — nincs form
- `zod` — nincs validáció használat
- `recharts` — nincs chart
- `react-day-picker`, `date-fns` — nincs dátum kezelés
- `next-themes` — nincs theme váltás
- `embla-carousel-react` — nincs carousel
- `input-otp` — nincs OTP
- `cmdk` — saját CommandPalette van
- `vaul` — nincs drawer használat

## ÚJ FÁJLOK

### Store
- `src/store/types.ts` — EditorNode, DocumentSettings, ViewportState, UIState, stb.
- `src/store/editor-store.ts` — Zustand store minden slice-szal

### Core
- `src/editor/core/property-schema.ts` — Schema definíciók node típusonként

### Shared komponensek
- `src/components/shared/NumberInput.tsx` — közös szám input (3x duplikáció feloldása)
- `src/components/shared/AnimatedSlider.tsx` — közös motion slider

### Inspector
- `src/editor/inspector/PropertyPanel.tsx` — schema-driven fő panel
- `src/editor/inspector/PropertyGroup.tsx` — property csoport renderelő
- `src/editor/inspector/PropertyField.tsx` — egyedi mező renderelő

### Command Palette
- `src/editor/command-palette/action-registry.ts` — bővíthető action rendszer

### Export
- `src/editor/export/intermediate-repr.ts` — IR réteg

### Oldal
- `src/pages/Editor.tsx` — új editor page resizable panelekkel

### Tesztek
- `src/test/store.test.ts` — store unit tesztek
- `src/test/export.test.ts` — export pipeline tesztek

## MÓDOSÍTANDÓ FÁJLOK
- `src/App.tsx` — routing frissítés (/ → Editor)
- `src/pages/Landing.tsx` — egyszerűsítés vagy törlés
- `src/components/glow-editor/RightSidebar.tsx` — shared komponensek import
- `src/components/glow-editor/LeftSidebar.tsx` — rebrand, store integration
- `src/components/glow-editor/GlowPreview.tsx` — store integration

## MAPPASTRUKTÚRA CÉL
```
src/
├── store/           # Zustand store + types
├── editor/
│   ├── core/        # Node types, property schema
│   ├── inspector/   # Schema-driven property panel
│   ├── export/      # Export pipeline + IR
│   └── command-palette/
├── components/
│   ├── shared/      # NumberInput, AnimatedSlider, stb.
│   ├── glow-editor/ # Legacy glow-specifikus (fokozatos migráció)
│   └── ui/          # shadcn/ui
├── lib/             # Utility-k
├── hooks/           # Custom hooks
├── pages/           # Route pages
└── test/            # Tesztek
```
