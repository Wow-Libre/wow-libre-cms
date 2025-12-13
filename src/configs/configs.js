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
  'Skoll Force';

export const SERVER_LOGO =
  process.env.NEXT_PUBLIC_SERVER_LOGO ||
  'https://static.wixstatic.com/media/5dd8a0_579b3dca76b7476a979eee00191f2365~mv2.png';
