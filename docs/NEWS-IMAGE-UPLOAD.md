# News image upload — guía de integración

Esta feature sustituye el campo "URL de imagen" del administrador de noticias
(`/realms/dashboard?activeOption=news`) por un uploader directo a S3, con
drag&drop, paste y validación de magic bytes.

## Flujo

```
NewsImageUploader (cliente)
  ├─ valida el archivo (mime + magic bytes, ≤ 10 MiB)
  ├─ POST /api/news/media/presign  →  { upload_url, public_url }
  ├─ POST /api/presigned-s3-upload (multipart)
  │     └─ PUT upload_url (con firma X-Amz-Signature)
  └─ emite onChange(public_url) → form.img_url
```

El componente reutiliza el proxy `/api/presigned-s3-upload` que ya endurecimos
en el PR de seguridad (allowlist de hosts S3/R2/GCS, bloqueo de RFC1918,
validación de firma, `redirect: manual`).

## Componentes nuevos

| Archivo | Propósito |
| --- | --- |
| `src/components/dashboard/news/NewsImageUploader.tsx` | UI drag/drop/paste con preview y validación cliente. |
| `src/lib/upload/newsImageUpload.ts` | Cliente de presign + upload (análogo a `presignedMediaUpload.ts` para social-feed). |
| `src/lib/upload/imageValidation.ts` | Magic bytes, allowlist MIME, cap 10 MiB. |
| `src/app/api/news/media/presign/route.ts` | Proxy Next.js → Wow Core para presign. |

## Cambios en componentes existentes

- `src/components/dashboard/news/index.tsx`: el input `URL de imagen` se
  sustituye por `<NewsImageUploader>` en el form principal y en el modal de
  subnoticias. Las funciones `createNew` / `updateNew` / `createNewSection`
  siguen recibiendo `img_url` por string, así que no hacen falta más cambios
  en la API cliente.
- `src/app/api/presigned-s3-upload/route.ts`: acepta opcionalmente un campo
  `context` (string ≤ 32 chars) en el multipart para correlacionar logs
  (`news`, `social-feed`, etc.).

## Endpoint nuevo requerido en Wow Core

`POST /api/news/media/presign`

Body:
```json
{
  "filename": "banner.png",
  "content_type": "image/png",
  "byte_size": 245678
}
```

Headers:
```
Authorization: Bearer <token>
Content-Type: application/json
transaction_id: <uuid>
```

Response 200:
```json
{
  "code": 200,
  "message": "OK",
  "data": {
    "upload_url": "https://bucket.s3.region.amazonaws.com/news/...?X-Amz-...",
    "public_url": "https://cdn.wowlibre.com/news/2026/11/<uuid>.png"
  }
}
```

Response 4xx/5xx:
```json
{ "code": 400, "message": "content_type no permitido", "data": null }
```

Comportamiento esperado:

1. Verificar token del admin (rol `NEWS_ADMIN` o superior).
2. Validar `content_type` ∈ {png, jpeg, gif, webp, avif}.
3. Validar `byte_size` ≤ 10 * 1024 * 1024 (10 MiB).
4. Sanear `filename` (sin `../`, sin `\0`, longitud ≤ 200).
5. Generar key con prefijo `news/<YYYY>/<MM>/<uuid>.<ext>`.
6. Firmar `PUT` con TTL corto (≤ 5 min) y devolver URL pública.
7. Persistir la key en BD para revocación / limpieza posterior.

## Configuración

No requiere nuevas variables de entorno. El bucket y credenciales se
configuran en Wow Core; el cliente usa la URL pública que el backend le
devuelva.

Si el bucket tiene CORS abierto para tu dominio puedes saltarte el proxy
Next.js poniendo `NEXT_PUBLIC_S3_UPLOAD_DIRECT=true` en `.env.local`. Por
defecto el proxy se usa para evitar CORS en el bucket.

## Mitigaciones aplicadas

- **CSRF**: el endpoint exige `Authorization: Bearer <token>`.
- **SSRF**: el proxy `/api/presigned-s3-upload` sigue validando host en
  allowlist (S3/R2/GCS) y bloqueando RFC1918/metadata.
- **Upload smuggling**: validación de magic bytes en `validateImageFile` —
  el archivo se rechaza si el MIME declarado difiere del contenido real.
- **DoS**: cap 10 MiB + timeout de subida heredado.
- **XSS via SVG**: SVG no permitido (no está en `ALLOWED_MIMES`).

## Backlog

- [ ] Multi-imagen (galerías dentro de la noticia).
- [ ] Recorte / focal point antes de subir.
- [ ] Lazy load + blurDataURL para la preview.
- [ ] Mostrar el bucket/CDN activo en la UI para debugging.
