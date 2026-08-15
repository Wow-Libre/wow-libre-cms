# Security Policy

## Versiones soportadas

| Rama / Versión | Soporte        |
| -------------- | -------------- |
| `master`       | ✅ Activa      |
| `feature/*`    | ⚠️ Hasta merge |
| otras ramas    | ❌ Sin soporte  |

Sólo se aplican parches de seguridad sobre `master`. Una vez mergeadas a `master`
se generan releases con tags SemVer (`vX.Y.Z`).

## Reportar una vulnerabilidad

Por favor **no abras un issue público** para vulnerabilidades. Usa una de las
siguientes vías privadas:

- **Email**: `security@wowlibre.com` (GPG disponible bajo petición).
- **GitHub Security Advisories**: *Report a vulnerability* en la página del repo
  `Wow-Libre/wow-libre-cms`. Es el canal preferido porque dispara un hilo
  coordinado y notifica a los maintainers.
- **Discord**: contactar a un miembro del equipo core en `#security`.

### Información a incluir

1. Título descriptivo.
2. Pasos para reproducir (PoC, request/response, capturas).
3. Impacto observado y esperado (lectura de datos, RCE, DoS, etc.).
4. Versión/commit afectado y entorno (Next.js, Node, navegador).
5. ¿Es el reporte público? Si no, mantén la confidencialidad hasta el fix.

## Tiempos de respuesta esperados

| Etapa                     | SLA objetivo  |
| ------------------------- | ------------- |
| Acuse de recibo           | ≤ 72 h        |
| Triage y clasificación    | ≤ 7 días      |
| Patch para severidad alta | ≤ 30 días     |
| Patch para severidad baja | próximo release |
| Disclosure pública        | coordinada    |

Una vulnerabilidad se considera **resuelta** cuando:

- Hay un commit en `master` que cierra el vector.
- La release está publicada en GitHub con notas descriptivas.
- Se notifica al reportador y, si lo desea, se le acredita en el `CHANGELOG`.

## Política de disclosure

Seguimos **Coordinated Disclosure**:

- El reporte se mantiene privado hasta que haya un fix o se cumpla el SLA.
- Si el reportador publica antes del fix, se intenta coordinar una fecha común.
- Los CVEs se solicitan vía GitHub Security Advisories cuando aplica.

## Endurecimiento aplicado al proyecto

Este repositorio mantiene un documento vivo en
[`docs/SECURITY-HARDENING.md`](./docs/SECURITY-HARDENING.md) con los controles
implementados: headers, allowlists, matcher del proxy, validación de rutas,
auditorías automatizadas y proceso de actualización de dependencias.

## Reconocimientos

Las personas que reporten vulnerabilidades de forma responsible serán listadas
(según prefieran) en el `CHANGELOG` y en la sección *Acknowledgements* del sitio
público cuando así lo autoricen.
