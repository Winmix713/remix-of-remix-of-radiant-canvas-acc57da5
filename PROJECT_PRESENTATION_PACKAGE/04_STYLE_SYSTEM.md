# 04 — Vizuális Rendszer (Style System)

---

## Összefoglaló

A projekt egy érett, koherens dark-first design rendszert használ glassmorphic felületekkel. A rendszer HSL-alapú CSS custom property-kre (design tokenekre) épül, Tailwind CSS-sel integrálva.

---

## Színek

### Alap tokének (`:root` — index.css)

| Token | HSL érték | Szín | Szerep |
|-------|-----------|------|--------|
| `--background` | `0 0% 5%` | Majdnem fekete | Fő háttér |
| `--foreground` | `0 0% 95%` | Majdnem fehér | Fő szöveg |
| `--primary` | `142 71% 45%` | Élénk zöld (#4ade80-közeli) | Kiemelt elem, akcentus |
| `--primary-foreground` | `0 0% 0%` | Fekete | Szöveg primary háttéren |
| `--secondary` | `0 0% 11%` | Sötétszürke | Másodlagos háttér |
| `--muted` | `0 0% 13%` | Szürke | Tompított háttér |
| `--muted-foreground` | `0 0% 45%` | Középszürke | Tompított szöveg |
| `--destructive` | `0 62% 50%` | Piros | Törlés, hiba |
| `--border` | `0 0% 15%` | Sötétszürke | Szegélyek |
| `--ring` | `142 71% 45%` | Zöld | Focus ring |

### Editor-specifikus tokének

| Token | Érték | Szerep |
|-------|-------|--------|
| `--editor-surface` | `0 0% 100% / 0.03` | Felületek háttere (3% fehér) |
| `--editor-surface-hover` | `0 0% 100% / 0.06` | Hover állapot |
| `--editor-border` | `0 0% 100% / 0.08` | Szegélyek (8% fehér) |
| `--editor-border-hover` | `0 0% 100% / 0.12` | Hover szegély |
| `--editor-text-dim` | `0 0% 45%` | Halvány szöveg |
| `--editor-text-muted` | `0 0% 60%` | Tompított szöveg |

### Glass/felület tokének

| Token | Érték | Szerep |
|-------|-------|--------|
| `--glass-bg` | `0 0% 7%` | Üveg felület háttér |
| `--glass-border` | `0 0% 100% / 0.08` | Üveg szegély |
| `--glass-border-hover` | `0 0% 100% / 0.15` | Hover |
| `--glass-highlight` | `0 0% 100% / 0.03` | Kiemelés |

### Hardcoded színek (LeftSidebar)

```typescript
const GLOW = {
  primary: "#A8FF50",           // Lime zöld — eltér a CSS --primary-tól!
  primaryDim: "rgba(168,255,80,0.14)",
  primaryTint: "rgba(168,255,80,0.07)",
  primaryGlow: "rgba(168,255,80,0.28)",
  primaryRing: "rgba(168,255,80,0.30)",
};
```

**⚠️ INKONZISZTENCIA:** A LeftSidebar saját `GLOW` objektumot használ `#A8FF50` lime zölddel, ami eltér a CSS `--primary` (142 71% 45% ≈ #2ECC40 sötétebb zöld) tokentől. Ez vizuális inkonzisztenciát okoz.

---

## Tipográfia

| Token | Érték |
|-------|-------|
| **Body font** | `'JetBrains Mono', 'Inter', system-ui, monospace` (index.css) |
| **Sans font** (tailwind) | `'Inter', system-ui, sans-serif` |
| **Mono font** (tailwind) | `'JetBrains Mono', ui-monospace, monospace` |
| **Font source** | Google Fonts import (index.css) |

### Tipográfiai skála (használt méretek)

| Méret | Használat |
|-------|-----------|
| `text-[7px]` | Vonalzó számok |
| `text-[8px]` | Csoport badge, legapróbb labelek |
| `text-[9px]` | Prop labelek, shortcut billentyűk, state kijelzők |
| `text-[10px]` | Szekció címek, gombok, slider értékek |
| `text-[11px]` | Rétegnevek, input mezők, tab címek |
| `text-xs` (12px) | Általános szöveg |
| `text-sm` (14px) | Panel címek, inputok |
| `text-base` (16px) | Landing hero leírás |
| `text-lg` (18px) | Modal címek |
| `text-2xl`–`text-6xl` | Landing hero cím |

**⚠️ MEGJEGYZÉS:** Sok helyen pixel-alapú méret (`text-[9px]`, `text-[10px]`), ami nehezen karbantartható. A végső rendszerben érdemes egy tipográfiai skálát definiálni.

---

## Spacing

Nincs explicit spacing skála; a Tailwind alapértelmezett 4px-es rendszere van használva (`gap-1`, `p-2`, `mb-4`, stb.).

**Gyakori értékek:**
- `p-2` (8px), `p-4` (16px), `p-5` (20px), `p-6` (24px)
- `gap-1` (4px), `gap-1.5` (6px), `gap-2` (8px), `gap-3` (12px)
- `rounded-xl` (12px), `rounded-2xl` (16px), `rounded-3xl` (24px), `rounded-[2rem]`, `rounded-[3rem]`

---

## Border Radius skála

| Token / Érték | Pixel | Használat |
|---------------|-------|-----------|
| `--radius` | `1rem` (16px) | Alapértelmezett |
| `--radius-sm` | `8px` | Kis elemek |
| `--radius-lg` | `18px` | Control section |
| `--radius-xl` | `24px` | Nagy kártyák |
| `rounded-full` | 9999px | Glow rétegek, swatch-ok |
| `rounded-[1.5rem]` | 24px | Toolbar pill |
| `rounded-[2rem]` | 32px | Preview keret |
| `rounded-[3rem]` | 48px | Canvas keret |

---

## Shadow skála

| Token | Érték | Használat |
|-------|-------|-----------|
| `--shadow-depth` | `0 32px 64px -16px hsla(0 0% 0% / 0.65)` | Mély árnyék |
| `--shadow-ambient` | `0 16px 32px -8px hsla(0 0% 0% / 0.45)` | Környezeti árnyék |
| `--shadow-close` | `0 4px 12px hsla(0 0% 0% / 0.35)` | Közeli árnyék |
| `--shadow-inset` | `inset 0 1px 1px hsla(0 0% 100% / 0.03)` | Belső fénycsík |
| `--shadow-top` | `0 -0.5px 0 hsla(0 0% 100% / 0.08)` | Felső szegélyfény |

Sok inline shadow is van, pl.:
- `shadow-[0_0_20px_rgba(var(--primary),0.3)]` — szelekciós glow
- `shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)]` — command palette

---

## Glass / Surface rendszer

A `glass-surface` CSS osztály a projekt egyik legértékesebb vizuális eleme:

```css
.glass-surface {
  background: 
    radial-gradient(at 0% 0%, hsla(var(--primary) / 0.03) ...) ,
    linear-gradient(135deg, hsla(0 0% 100% / 0.05) ...) ,
    hsla(0 0% 7% / 0.4);
  backdrop-filter: blur(32px) saturate(1.4);
  border: 1px solid hsla(0 0% 100% / 0.08);
  box-shadow: 0 16px 40px ...;
}
```

**Értékelés:** Érett, szép megoldás. Átvihető a végső rendszerbe.

---

## Sötét / Világos theme

A projekt **kizárólag dark mode**-ot támogat. Nincs `:root` vs. `.dark` class váltás. A `themeMode` state a **glow effektus** háttérszínét váltja (dark/light), nem az editor UI-ját.

**⚠️ A végső rendszerhez:** Light mode támogatás szükséges — teljes light token set kell.

---

## Transition / Animation tokének

| Token | Érték |
|-------|-------|
| `--t-fast` | `0.12s` |
| `--t-normal` | `0.2s` |
| `--ease-smooth` | `cubic-bezier(0.2, 0, 0, 1)` |
| `--ease-spring` | `cubic-bezier(0.175, 0.885, 0.32, 1.275)` |
| `--blur-panel` | `32px` |
| `--blur-overlay` | `12px` |

---

## Inkonzisztenciák

1. **LeftSidebar `GLOW` objektum** vs. CSS `--primary` — eltérő zöld árnyalat
2. **Inline shadow értékek** vs. `--shadow-*` tokének — sok helyen inline
3. **Pixel-alapú font méretek** (`text-[9px]`) vs. Tailwind skála — keverve használva
4. **Border radius** — nagyon sok egyedi érték (`rounded-[1.5rem]`, `rounded-[2rem]`, `rounded-[3rem]`)
5. **Hardcoded `bg-black/60`**, `bg-white/10` stb. — nem tokenizált
6. **Duplikált NumberInput, AnimatedSlider** — LeftSidebar, RightSidebar és ControlPanel mindháromban külön implementáció

---

## Design system érettség értékelése

| Aspektus | Érettség | Megjegyzés |
|----------|----------|------------|
| Szín tokenek | ★★★★☆ | Jó token rendszer, de van inkonzisztencia |
| Tipográfia | ★★★☆☆ | Font pár jó, de nincs formális skála |
| Spacing | ★★★☆☆ | Tailwind default, nincs egyedi rendszer |
| Radius | ★★☆☆☆ | Túl sok egyedi érték |
| Shadow | ★★★★☆ | Jó token rendszer |
| Glass surface | ★★★★★ | Kiváló, production-kész |
| Theme (dark/light) | ★★☆☆☆ | Csak dark |
| Konzisztencia | ★★★☆☆ | Van duplikáció és hardcoded érték |
