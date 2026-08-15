# News admin UX — guía del rediseño

Esta rama refactoriza el administrador de noticias en
`/realms/dashboard?activeOption=news` con foco en legibilidad, jerarquía
visual y feedback.

## Antes → Después

| Antes | Después |
| --- | --- |
| Form grande arriba, lista debajo | Layout 2 columnas: lista (flex) + editor sticky 360px |
| Botones `Crear` / `Actualizar` ambiguos | Un único CTA `Crear noticia` / `Guardar cambios` que cambia según el contexto |
| Selección invisible | Card seleccionada: ring indigo + badge `Editando` |
| Sin búsqueda / filtro | Toolbar con search, tabs de estado (Todas / Publicadas / Borradores / Archivadas) y sort (recientes / antiguos / título) |
| Sin estado editorial | Tres estados `DRAFT` / `PUBLISHED` / `ARCHIVED` con badge y tone |
| Sin métricas | Tarjetas de stats: total, publicadas, borradores, últimos 7 días |
| SweetAlert2 para todo | Toasts inline para feedback no destructivo, modal solo para confirmaciones |
| Sin preview | Live preview de la card mientras se escribe |
| Sin empty state | Empty state con CTA contextual |
| Spinners | Skeleton cards |
| Sin contador de subnoticias | Badge numérico en la card |

## Estructura nueva

```
src/components/dashboard/news/
├── index.tsx               orquestación (581 líneas vs 895 antes)
├── NewsImageUploader.tsx   (existente) uploader S3
├── NewsCard.tsx            card con status + actions
├── NewsEditor.tsx          form sticky con live preview
├── NewsToolbar.tsx         search + filter + sort + CTA
├── NewsStats.tsx           4 tiles de contadores
├── NewsStatusBadge.tsx     pill con tone
├── NewsPreview.tsx         vista previa en vivo
├── NewsEmptyState.tsx      empty state con CTA
├── NewsCardSkeleton.tsx    loading state
├── newsHelpers.ts          filter, sort, search, format
├── newsToast.tsx           toaster non-blocking
└── newsConstants.ts
```

## Estado editorial

`NewsModel` ahora admite `status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'`.

- Si el backend Wow Core aún no soporta el campo, las llamadas de la API
  envían el body sin `status` (extend-safe) y la UI lo lee del campo si
  viene en la respuesta, falling back a `PUBLISHED` si falta.
- `api/news/index.tsx` envía `status` condicionalmente (`...(status ? { status } : {})`)
  para mantener compat con backends viejos.

### Compatibilidad de backend

Para Wow Core, los endpoints `POST /api/news` y `PUT /api/news/{id}` deben
aceptar opcionalmente `status: "DRAFT" | "PUBLISHED" | "ARCHIVED"`. Si el
backend no implementa el campo, el payload sin `status` sigue siendo
válido.

Recomendaciones:

- Tabla `news`: añadir `status VARCHAR(16) NOT NULL DEFAULT 'PUBLISHED'`.
- Backend añade índice en `status` para listas filtradas.
- Web pública filtra `WHERE status = 'PUBLISHED'` en los endpoints de lectura.

## Toast non-blocking

`newsToast.tsx` exporta `showNewsToast(message, kind, ttlMs)` y monta un
viewport; las confirmaciones destructivas (eliminar) siguen usando
`dashboardSwal` para pedir confirmación explícita.

## Subnoticias

- La card de cada noticia muestra un contador `Subnoticias N` en la barra
  de acciones cuando ya tiene subnoticias.
- El modal de subnoticias está limpio: lista compacta con orden, imagen
  thumbnail, título y botón de eliminar por fila. CTA `+ Nueva subnoticia`
  en el footer (donde estaba escondido en una card).

## Responsive

- `xl:` (≥1280px): 2 columnas con editor sticky.
- `lg:` y menores: 1 columna, el editor queda al final como una sección
  colapsable más (no es sticky para no ocupar toda la pantalla).

## Verificación

- `npm run typecheck` ✅
- `npm run build` ✅ (39 páginas, 581 líneas en index.tsx vs 895)
- `npm run security:check` ✅
