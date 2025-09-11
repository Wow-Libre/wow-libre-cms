/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
      BASE_URL_CORE: process.env.NEXT_PUBLIC_BASE_URL_CORE,
      BASE_URL_TRANSACTION: process.env.NEXT_PUBLIC_BASE_URL_TRANSACTION,
      GOOGLE_API_KEY_RE_CAPTCHA: process.env.GOOGLE_API_KEY_RE_CAPTCHA,
      SERVER_NAME: process.env.SERVER_NAME,
      SERVER_LOGO: process.env.SERVER_LOGO,
    },};

export default nextConfig;
