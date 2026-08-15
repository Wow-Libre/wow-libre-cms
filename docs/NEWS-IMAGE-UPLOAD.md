# News image upload — guía de integración

Esta feature sustituye el campo "URL de imagen" del administrador de noticias
(`/realms/dashboard?activeOption=news`) por un uploader directo a S3 con
drag&drop, paste y validación de magic bytes.

## Flujo

```
NewsImageUploader (cliente)
  ├─ valida el archivo (mime + magic bytes, ≤ 10 MiB)
  ├─ POST /api/social/media/presign  { prefix: "news/", ... }
  │     →  { upload_url, public_url }
  ├─ POST /api/presigned-s3-upload (multipart)
  │     └─ PUT upload_url (firma X-Amz-Signature)
  └─ onChange(public_url) → form.img_url
```

Reutiliza el proxy `/api/presigned-s3-upload` que ya endurecimos en el
PR de seguridad (allowlist de hosts S3/R2/GCS, bloqueo de RFC1918,
validación de firma, `redirect: manual`).

## Componentes

| Archivo | Propósito |
| --- | --- |
| `src/components/dashboard/news/NewsImageUploader.tsx` | UI drag/drop/paste con preview y validación cliente. |
| `src/lib/upload/presignedMediaUpload.ts` | `requestMediaPresign(token, { filename, content_type, byte_size, prefix })` + `uploadImageFile(...)`. |
| `src/lib/upload/newsImageUpload.ts` | Wrapper de news: `uploadNewsImage(token, file)` usa `prefix: "news/"`. |
| `src/lib/upload/imageValidation.ts` | Magic bytes, allowlist MIME, cap 10 MiB. |

> **Por qué reusamos `/api/social/media/presign`**: el endpoint ya
> existe en Wow Core y firma PUTs sobre el mismo bucket. Si el backend
> acepta el campo `prefix` opcional, las imágenes de news se guardan
> en `news/...` dentro del bucket segregadas de las de social.

## Cambio en el frontend

`src/lib/upload/presignedMediaUpload.ts` ahora acepta un `prefix`
opcional en `requestMediaPresign` y `uploadImageFile`. El payload
incluye `prefix` solo si está aplicado para mantener compat con
backends viejos.

```ts
await uploadImageFile(token, file, { prefix: "news/" });
```

## Configuración

No requiere variables de entorno nuevas. El bucket y credenciales se
configuran en Wow Core; el cliente usa la URL pública que el backend
devuelva.

Si el bucket tiene CORS abierto para tu dominio puedes saltarte el
proxy Next.js poniendo `NEXT_PUBLIC_S3_UPLOAD_DIRECT=true` en
`.env.local`. Por defecto el proxy se usa para evitar CORS en el
bucket.

## Mitigaciones aplicadas

- **CSRF**: el presign exige `Authorization: Bearer <token>` propio del
  admin; el proxy S3 sólo reenvía uploads válidos.
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
- [ ] Validar que el backend acepte `prefix` (si no, generar segregación
      en cliente prefijando el filename).
