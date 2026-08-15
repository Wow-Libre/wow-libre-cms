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
| Sin búsqueda | Toolbar con search + sort + contador |
| Sin métricas | Tarjetas de stats: total, últimos 7 días, con imagen, con subtítulo |
| Sin preview | Live preview de la card mientras se escribe |
| SweetAlert2 para todo | Toasts inline para feedback no destructivo, modal solo para confirmaciones |
| Sin empty state | Empty state con CTA contextual |
| Spinners | Skeleton cards |
| Sin contador de subnoticias | Badge numérico en la card |

## Estructura nueva

```
src/components/dashboard/news/
├── index.tsx               orquestación
├── NewsImageUploader.tsx   uploader S3 (compartido con feature/realms-news-s3-upload)
├── NewsCard.tsx            card con selección + actions
├── NewsEditor.tsx          form sticky con live preview
├── NewsToolbar.tsx         search + sort + CTA
├── NewsStats.tsx           4 tiles de contadores
├── NewsPreview.tsx         vista previa en vivo
├── NewsEmptyState.tsx      empty state con CTA
├── NewsCardSkeleton.tsx    loading state
├── newsHelpers.ts          filter, sort, search, format
└── newsToast.tsx           toaster non-blocking
```

## Subida de imágenes a S3

El uploader reusa el endpoint de presign ya existente en Wow Core
(`/api/social/media/presign`) con el prefijo `news/`. Esto evita
desplegar un endpoint nuevo en el backend.

Pipeline:

```
NewsImageUploader
  ├─ validateImageFile (magic bytes + cap 10 MiB)
  ├─ POST /api/social/media/presign  { prefix: "news/", ... }
  ├─ POST /api/presigned-s3-upload (multipart)
  │     └─ PUT upload_url (firma X-Amz-Signature)
  └─ onChange(public_url) → setForm.img_url
```

Helpers en `src/lib/upload/`:
- `presignedMediaUpload.ts` — `requestMediaPresign(token, { filename, content_type, byte_size, prefix })` + `uploadImageFile(...)`
- `newsImageUpload.ts` — `uploadNewsImage(token, file)` con `prefix: "news/"`

> Si el backend Wow Core acepta el campo `prefix` opcional, las imágenes
> de news se guardan en `news/...` dentro del bucket. Si no lo soporta,
> el upload sigue funcionando (se omite `prefix` del body).

## Estado editorial (no implementado)

El backend Wow Core no soporta aún un campo de estado (`status`) en
noticias. Se dejó en `NewsModel.status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'`
como **forward-compatible** — si el backend lo añade, la UI puede
pintar el badge sin tocar la API. Hoy la UI no expone ningún selector
porque no hay contrato que respete.

## Toast non-blocking

`newsToast.tsx` exporta `showNewsToast(message, kind, ttlMs)` y monta un
viewport; las confirmaciones destructivas (eliminar) siguen usando
`dashboardSwal` para pedir confirmación explícita.

## Subnoticias

- La card de cada noticia muestra un contador `Subnoticias N` en la
  barra de acciones cuando ya tiene subnoticias.
- El modal de subnoticias está limpio: lista compacta con orden, imagen
  thumbnail, título y botón de eliminar por fila. CTA `+ Nueva subnoticia`
  en el footer del modal.

## Responsive

- `xl:` (≥1280px): 2 columnas con editor sticky.
- `lg:` y menores: 1 columna, el editor queda al final como una
  sección normal (no sticky para no saturar la pantalla).

## Verificación

- `npm run typecheck` ✅
- `npm run build` ✅
- `npm run security:check` ✅
