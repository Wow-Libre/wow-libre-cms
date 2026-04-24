---
name: wow-libre-immersive-ui
description: >-
  Applies the Wow Libre CMS immersive page shell (midnight background, embers,
  decorative treant, z-index stacking) and navbar/footer rules so new routes stay
  visually consistent. Use when adding or refactoring pages, layouts, bank/store/news
  heroes, footers, or navbar-authenticated; when the user mentions treant, fire-embers,
  seamless footer, double footer, or z-index overlays.
---

# Wow Libre — UI inmersiva (shell + navbar + footer)

## Cuándo leer esta skill

- Nueva página o sección con fondo “gaming” como register/help/news/store/guild/bank/community.
- Ajustes de hero (bank), decoración lateral, o el usuario reporta **dos footers**, **dropdown del navbar tapado**, o **hueco raro arriba del navbar**.

## Constante decorativa (treant)

Reutilizar la misma URL en páginas que lleven el personaje decorativo:

```ts
const REGISTER_DECORATIVE_TREANT =
  "https://static.wixstatic.com/media/5dd8a0_a1d175976a834a9aa2db34adb6d87d02~mv2.png";
```

Imagen típica (ajustar `right-*` si hace falta):

- Clases base: `accounts-decoration-animated pointer-events-none absolute bottom-0 … opacity-80 drop-shadow-[0_0_28px_rgba(56,189,248,0.35)]`
- Visibilidad: `hidden md:block` (o el breakpoint acordado).
- Posición horizontal: `right-4 lg:right-10 xl:right-16` con anchos `w-[20rem] lg:w-[24rem] xl:w-[28rem]`.

## Shell de página (patrón estándar)

Envolver el contenido de la ruta en un **único** bloque raíz:

1. **Raíz**: `relative overflow-visible bg-midnight` (+ `pb-16` si hace falta aire antes del footer global).
2. **Capas de fondo** (en este orden, `pointer-events-none`):
   - `absolute inset-0 fire-embers-blue opacity-50`
   - `absolute inset-0` con los dos `radial-gradient` cyan/azul (mismo patrón que en `register/page.tsx` o `help/page.tsx`).
3. **Treant**: `img` con constante de arriba, `z-[1]`.
4. **Contenido**:
   - Navbar (si aplica): dentro de `div.contenedor.relative.z-30` para que wallet/menús queden por encima del resto del layout de la página.
   - Resto: `div.relative.z-10` con el contenido principal.

**No** usar `overflow-hidden` en la raíz de páginas con `NavbarAuthenticated` y modales portaled/sticky agresivos: recorta overlays. Si hace falta recorte, aplicarlo solo a bloques internos (cards, heroes), no al wrapper de toda la vista.

## Navbar autenticado (`src/components/navbar-authenticated/index.tsx`)

- **Espacio superior**: usar **`pt-10`**, no **`mt-10`**, en el `<nav>`. El margen superior deja una franja sin el fondo del nav; el padding mantiene el mismo ritmo visual sin hueco “vacío”.
- Estilo barra (proyecto): `bg-transparent border-b border-cyan-500/20 bg-slate-950/70` (y `relative z-[120]` en el `nav` si hace falta stacking con el contenido de la página).
- **Modales / wallet / notificaciones**: overlays y diálogos deben ir en **`z-index` mayor** que el contenido de la página; si una sección usa `sticky` o `z-20+`, subir el contenedor del navbar (`z-30`) o los modales según haga falta — sin duplicar footers.

## Footer global

- El layout raíz ya monta **`FooterVisibility`** (`src/app/layout.tsx`). **No** importar ni renderizar `<Footer />` dentro de páginas o componentes de ruta salvo caso excepcional documentado (evita **doble footer**). Ejemplo corregido: `src/components/account/accountIngame/page.tsx` (register/username).

### Rutas “pegadas” al footer (sin `mt` extra)

Mantener la lista en `src/components/footer/index.tsx` (`seamlessRoutes`) alineada con las vistas que usan shell full-bleed. Al añadir una página nueva con el mismo tratamiento, **incluir su prefijo** ahí si debe unirse visualmente al footer.

## Hero Bank (`src/app/bank/page.tsx`)

- Fondo alineado al tema midnight/cyan: gradiente `slate-950` / `slate-900`, capas radiales + partículas cyan/sky.
- **Sin** borde redondeado ni márgenes laterales en el hero si debe ser **ancho completo** (`w-full`).
- Evitar “espaciadores” decorativos duplicados bajo secciones (bloques solo de `border-t` + punto) salvo que el producto lo pida.

## Checklist rápido (nueva vista autenticada)

- [ ] Shell: `bg-midnight` + embers + radiales + treant opcional.
- [ ] `overflow-visible` en raíz si hay navbar con modales.
- [ ] `contenedor` + `z-30` solo alrededor del navbar; contenido en `z-10`.
- [ ] No segundo `<Footer />` en la página.
- [ ] Si aplica, prefijo en `seamlessRoutes` del footer.

## Referencias en el repo

Ejemplos concretos: `src/app/register/page.tsx`, `src/app/help/page.tsx`, `src/app/news/page.tsx`, `src/app/store/page.tsx`, `src/app/guild/page.tsx`, `src/app/bank/page.tsx`, `src/app/community/page.tsx`, `src/components/navbar-authenticated/index.tsx`, `src/components/footer/index.tsx`.
