# Hardening de seguridad — wow-libre-cms

Este documento describe los controles de seguridad aplicados al CMS de
**WoW Libre**, qué CVEs cierran, cómo mantenerlos y cómo extenderlos.

> Última revisión: rama `feature/security-fixes-2025-11`.

---

## Resumen ejecutivo

| Vector                                        | Mitigación                                  | Archivo                                       |
| --------------------------------------------- | ------------------------------------------- | --------------------------------------------- |
| Middleware / Proxy bypass (locale único)      | `config.matcher` estricto + `default`        | `src/proxy.ts`                                |
| SSRF en rewrites (host destino)               | Allowlist de hosts + helper central         | `next.config.mjs`, `src/lib/security/...`     |
| SSRF en proxys de la API (`/api/wow-core/...`)| Validación de segmentos + allowlist de host | `src/app/api/wow-core/[...path]/route.ts`     |
| SSRF vía presigned URL (S3)                   | Allowlist + bloqueo de RFC1918 + meta       | `src/app/api/presigned-s3-upload/route.ts`    |
| Path traversal en params dinámicas            | Regex `[A-Za-z0-9._-]{1,128}`               | `src/lib/security/proxy-allowlist.mjs`        |
| Headers inseguros                             | CSP, HSTS, COOP/COEP, etc.                  | `next.config.mjs`                             |
| Dependencias vulnerables                      | `npm audit` en CI + Dependabot              | `.github/workflows/security.yml` (CI)         |

---

## 1. CVE base: parche de Next.js

Se actualizó `next` de `16.2.6` a `16.3.1`, que contiene los parches para los
cuatro advisories que Dependabot había abierto:

1. *Next.js: Middleware / Proxy bypass in App Router applications using
   Turbopack and single locale*.
2. *Next.js: Server-Side Request Forgery in rewrites via attacker-controlled
   destination hostname*.
3. *Next.js: Server-Side Request Forgery in Server Actions on custom servers*.
4. *Next.js: Denial of Service in App Router using Server Actions*.

Aunque el proyecto **no** define Server Actions ni expone `rewrites()`, los
parches se aplican porque el código vulnerable vive dentro del runtime de
Next.js y se carga para servir cualquier ruta.

Además:

- `overrides` en `package.json` fuerza `postcss >= 8.5.23` (parchea
  las advertencias GHSA-6g55 / fxqj / r28c).
- `uuid` se subió a `^11.1.1` (GHSA-w5hq-g745-h8pq).
- `picomatch`, `cross-spawn`, `form-data`, `cookie` y `nanoid` se sobrescriben a
  versiones sanas.

---

## 2. `src/proxy.ts` — anti bypass

Puntos clave:

- Se exporta `default` (no función nombrada) para alinearse con la convención
  de Next.js 16.
- `config.matcher` filtra todo lo que **no** sea HTML:
  - Excluye `_next/static`, `_next/image`, `favicon.ico`, `robots.txt`,
    `sitemap.xml`, `api/` y cualquier archivo con extensión.
- `wantsHtml(request)` evita que un `fetch` programático desde el cliente
  (con headers `Accept: application/json`) toque el redirect.
- `isProtectedPath` ignora rutas con doble slash (`//`), que son un vector
  histórico de bypass cuando coexisten con detectores naive `startsWith`.
- Redirección a `/login` o `/` usa código `308` (permanente, conserva método).
- Las cookies se verifican con presencia **y valor no vacío**.

> Si necesitas extender las rutas protegidas, agrega el prefijo a
> `PROTECTED_PREFIXES` y valida manualmente con `pnpm test:e2e`.

---

## 3. `next.config.mjs` — allowlist + headers

### 3.1 Headers globales (todos los paths)

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-site
X-DNS-Prefetch-Control: off
```

Las rutas `/api/*` añaden `Cache-Control: no-store, max-age=0` para impedir
caching de respuestas autenticadas.

### 3.2 Rewrites (defense-in-depth)

Sólo se registra un rewrite si la variable `NEXT_PUBLIC_BASE_URL_CORE` apunta
a un host permitido (ver `src/lib/security/proxy-allowlist.mjs`). La
allowlist incluye:

- Hosts internos conocidos (`wow-core`, `localhost`, `127.0.0.1`).
- Dominios públicos del propio proyecto.
- Extensible vía `NEXT_PUBLIC_TRUSTED_PROXY_HOSTS=foo.com,bar.com`.

### 3.3 Imágenes

`images.remotePatterns` se mantiene explícito y `minimumCacheTTL: 60` evita que
se cacheen URLs firmadas durante más tiempo del deseado.

---

## 4. Proxy de Wow Core (`/api/wow-core/[...path]`)

Validaciones que rechazan el request con `400/403/503` antes de hacer `fetch`:

1. `pathSegments` deben cumplir `^[A-Za-z0-9._-]{1,128}$`.
2. Primer segmento ∈ `api` o prefijo `api-v*`.
3. Se prohíbe `..`, `\0`, `\\`, `%`, dobles slashes y segmentos vacíos.
4. Host de `WOW_CORE_INTERNAL_URL` / `NEXT_PUBLIC_BASE_URL_CORE` debe estar en
   el allowlist.
5. `redirect: 'manual'` en `fetch` evita que una respuesta 3xx sea seguida
   contra otro origen.
6. La respuesta `Cache-Control: no-store` se fuerza siempre.

> ⚠️ **Importante**: estos proxys son el último eslabón antes del backend
> `wow-core`. Si añades nuevos prefijos a la API, actualiza
> `ALLOWED_FIRST_SEGMENTS` y `ALLOWED_FIRST_PREFIX` y revisa la doc interna.

---

## 5. `/api/presigned-s3-upload`

Previene uploads arbitrarios a infraestructura interna:

- Bloquea hosts como `localhost`, `127.0.0.1`, `0.0.0.0`, `169.254.169.254`,
  `::1` (link-local AWS / metadata).
- Bloquea rangos RFC1918, 169.254/16 y `fc00::/7`.
- Sólo permite hosts que terminen en:
  - `.amazonaws.com`, `.amazonaws.com.cn`
  - `.r2.cloudflarestorage.com`
  - `.storage.googleapis.com`
  - Cualquier sufijo listado en `S3_UPLOAD_ALLOWED_HOST_SUFFIXES` (CSV).
- Verifica que la URL contenga `X-Amz-Signature` o `x-goog-signature` (URL
  presignada real, no URL arbitraria).
- `MAX_BYTES = 10 MiB` (configurable).
- `redirect: 'manual'` evita redirecciones a un bucket distinto.

---

## 6. `/api/armory/[name]`

- `name` validado con `^[A-Za-z]{2,12}$` (igual que un personaje de WoW).
- `realm_id`, `realm`, `expansion_id` se validan contra regex específicas.
- Se valida el host de `BASE_URL_CORE` antes de reenviar.
- Migrado a `randomUUID` nativo para no depender de la lib `uuid` en
  producción.

---

## 7. CI / automatización

### 7.1 Dependabot

`.github/dependabot.yml` ahora está bien formado para `npm` y `github-actions`:

- Pull requests agrupados por tipo (`production`, `development`).
- Ignora majors por defecto (se evalúan manualmente).
- Etiqueta automática `security` + `dependencies`.

### 7.2 GitHub Actions — `security.yml`

Workflow nuevo en cada `push`, PR y lunes 06:00 UTC:

1. `npm ci --omit=dev` y `npm audit --audit-level=high`.
2. Lint + build (`next build`) con `--max-warnings=0`.

### 7.3 CodeQL

`.github/workflows/codeql.yml` ya existente se mantiene; ejecuta análisis
estático sobre `master`, PRs y semanalmente.

---

## 8. Cómo mantenerlo

- Cuando añadas una ruta protegida nueva, edita `PROTECTED_PREFIXES` en
  `src/proxy.ts`.
- Si añades un rewrite nuevo, mantén la allowlist en
  `src/lib/security/proxy-allowlist.mjs`.
- Cada PR que toque el proxy, las rutas API o el `next.config.mjs` debe:
  - pasar `npm run lint`,
  - pasar `npm run build`,
  - haber revisado `docs/SECURITY-HARDENING.md`.

## 9. Trabajo pendiente (backlog)

- [ ] CSP estricta (`Content-Security-Policy`) — requiere inventario de
      dominios externos. Hoy se compensan los demás headers.
- [ ] Eliminar `crypto-js` (mantenimiento abandonado). La flag de seguridad
      viene del cliente y el backend no la debería validar con JS.
- [ ] Mover `/api/armory/[name]` a `force-static` con `revalidate` desde una
      perspectiva de cache, manteniendo la validación per-request.
