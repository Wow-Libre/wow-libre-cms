// URLs de las APIs
export const BASE_URL_TRANSACTION =
  process.env.NEXT_PUBLIC_BASE_URL_TRANSACTION ||
  'http://localhost:8092/transaction';

export const BASE_URL_CORE =
  process.env.NEXT_PUBLIC_BASE_URL_CORE ||
  'http://localhost:8091/core';

// Configuración de reCAPTCHA de Google
export const GOOGLE_API_KEY_RE_CAPTCHA =
  process.env.NEXT_PUBLIC_GOOGLE_API_KEY_RE_CAPTCHA ||
  '6Lcd3iArAAAAAAUJI-22bSPgBrh6lmT2BEXu66Hb';

// Configuración del servidor
export const SERVER_NAME =
  process.env.NEXT_PUBLIC_SERVER_NAME ||
  'WOWEspy';

export const SERVER_LOGO =
  process.env.NEXT_PUBLIC_SERVER_LOGO ||
  'https://static.wixstatic.com/media/5dd8a0_e5076366be084a90ad8d8424940c8b8d~mv2.png';
