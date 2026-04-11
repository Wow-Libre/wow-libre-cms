# Especificación Backend: Red social / feed de comunidad (Wow Core)

Este documento define el contrato de API, el esquema de base de datos y la integración **AWS (S3 + SES)** que debe implementar **Wow Core** para alinear el CMS (`wow-libre-cms`) con el feed tipo Facebook: publicaciones, **me gusta** y **comentarios**, con **multimedia** alojada en S3.

**Base URL del módulo:** `{BASE_URL_CORE}/api/social`  
**Encabezados comunes (igual que el resto del core):** `Authorization: Bearer <token>`, `transaction_id`, `Content-Type: application/json`.

**Respuesta estándar:** `GenericResponseDto<T>` (`code`, `message`, `transaction_id`, `data`).

Copia este documento al repositorio **wow-core** (por ejemplo `docs/social-feed-backend-spec.md`) cuando lo integres allí.

---

## 1. Modelo de datos (SQL)

### 1.1 Publicaciones

```sql
CREATE TABLE social_post (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL COMMENT 'ID usuario web / cuenta CMS',
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  INDEX idx_user_created (user_id, created_at DESC)
);
```

### 1.2 Adjuntos (URLs finales tras subida a S3)

```sql
CREATE TABLE social_post_media (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  post_id BIGINT NOT NULL,
  url VARCHAR(1024) NOT NULL,
  sort_order INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_media_post FOREIGN KEY (post_id) REFERENCES social_post(id) ON DELETE CASCADE,
  INDEX idx_post (post_id)
);
```

### 1.3 Me gusta (un usuario, un like por publicación)

```sql
CREATE TABLE social_post_like (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  post_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_post_user (post_id, user_id),
  CONSTRAINT fk_like_post FOREIGN KEY (post_id) REFERENCES social_post(id) ON DELETE CASCADE,
  INDEX idx_post (post_id)
);
```

### 1.4 Comentarios

```sql
CREATE TABLE social_post_comment (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  post_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  content VARCHAR(2000) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  CONSTRAINT fk_comment_post FOREIGN KEY (post_id) REFERENCES social_post(id) ON DELETE CASCADE,
  INDEX idx_post_created (post_id, created_at)
);
```

---

## 2. Integración AWS — multimedia (S3)

### 2.1 Flujo recomendado (presigned URL)

1. Cliente (CMS) llama a **POST** `/api/social/media/presign` con metadatos del archivo.
2. Core valida tamaño/MIME, genera **PUT presigned URL** de S3 y devuelve `upload_url`, `public_url` (o CDN), `key`.
3. Cliente hace **PUT** directo a S3 con el archivo.
4. Al crear la publicación, el cliente envía `media_urls: [public_url, ...]` en **POST** `/api/social/posts`.

### 2.2 Variables de entorno (servidor, no exponer secretos al navegador)

| Variable                                      | Uso                                                             |
| --------------------------------------------- | --------------------------------------------------------------- |
| `AWS_REGION`                                  | Región S3/SES                                                   |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | Credenciales del rol de aplicación (o usar IAM role en EC2/ECS) |
| `SOCIAL_S3_BUCKET`                            | Bucket dedicado p.ej. `wowlibre-social-prod`                    |
| `SOCIAL_S3_PREFIX`                            | Prefijo opcional p.ej. `posts/`                                 |
| `SOCIAL_MEDIA_MAX_BYTES`                      | Tamaño máximo (ej. 10485760 = 10 MB)                            |
| `SOCIAL_MEDIA_ALLOWED_MIME`                   | Lista permitida: `image/jpeg,image/png,image/webp,video/mp4`    |

**Política S3 (idea):** prefijos por `user_id/` o `posts/{uuid}/`; objetos **privados** con CloudFront firmado, o **públicos de lectura** solo si aceptas URLs públicas (documentar decisión).

### 2.3 Contrato: presign

**POST** `/api/social/media/presign`

Body:

```json
{
  "filename": "screenshot.png",
  "content_type": "image/png",
  "byte_size": 245000
}
```

Respuesta `data`:

```json
{
  "upload_url": "https://bucket.s3.amazonaws.com/...",
  "public_url": "https://cdn.tudominio.com/posts/.../screenshot.png",
  "key": "posts/uuid/screenshot.png",
  "expires_in_seconds": 300
}
```

Errores: 400 validación, 413 tamaño, 401 no autenticado.

---

## 3. Integración AWS — correo (SES) (opcional)

Para notificar **nuevo comentario** o **menciones** (futuro), Wow Core puede usar **Amazon SES**.

| Variable         | Uso                                                       |
| ---------------- | --------------------------------------------------------- |
| `AWS_SES_FROM`   | Dirección verificada en SES (ej. `noreply@tudominio.com`) |
| `AWS_SES_REGION` | Si difiere de `AWS_REGION`                                |

No envíes correos masivos sin cola (SQS) y límites de SES. El CMS no requiere SES para el MVP del feed si solo muestras datos en pantalla.

---

## 4. API REST

### 4.1 Listar publicaciones

**GET** `/api/social/posts?page=0&size=10`

- Requiere autenticación.
- `data`: página de posts con autor resuelto (join perfil), contadores y `liked_by_me`.

**Ejemplo `data.content[]`:**

```json
{
  "id": 1,
  "user_id": 42,
  "author_username": "Thrall",
  "author_avatar": "https://...",
  "content": "¡LFG raid!",
  "media_urls": ["https://cdn.../a.png"],
  "likes_count": 12,
  "comments_count": 3,
  "liked_by_me": false,
  "created_at": "2026-04-09T12:00:00Z"
}
```

### 4.2 Crear publicación

**POST** `/api/social/posts`

```json
{
  "content": "Texto obligatorio (puede ser corto si solo hay media).",
  "media_urls": []
}
```

### 4.3 Toggle me gusta

**POST** `/api/social/posts/{postId}/like`

`data`:

```json
{
  "liked": true,
  "likes_count": 13
}
```

(Idempotente: si ya había like, quita; si no, agrega.)

### 4.4 Listar comentarios

**GET** `/api/social/posts/{postId}/comments?page=0&size=20`

### 4.5 Crear comentario

**POST** `/api/social/posts/{postId}/comments`

```json
{ "content": "¡Nos vemos en la raid!" }
```

`data`: objeto comentario con `id`, `user_id`, `author_username`, `author_avatar`, `content`, `created_at`.

---

## 5. Seguridad

- Validar JWT y `user_id` en todas las rutas mutantes.
- Sanitizar texto (longitud, XSS en contenido mostrado en web; el CMS escapa al renderizar).
- Rate limiting en creación de posts/comentarios y en presign.
- No registrar secretos AWS en el frontend; solo URLs presignadas de corta duración.

---

## 6. Alineación con el CMS (`wow-libre-cms`)

El cliente usa `NEXT_PUBLIC_BASE_URL_CORE` y llama a los endpoints anteriores. Si el backend aún no está desplegado, la UI muestra estado vacío o error controlado hasta que el core esté disponible.
