import { TRUSTED_PROXY_HOSTS, allowedRewriteDestination } from "./src/lib/security/proxy-allowlist.mjs";

const SECURITY_HEADERS = [
    {
        key: "X-Frame-Options",
        value: "DENY",
    },
    {
        key: "X-Content-Type-Options",
        value: "nosniff",
    },
    {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
    },
    {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
    },
    {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
    },
    {
        key: "X-DNS-Prefetch-Control",
        value: "off",
    },
    {
        key: "Cross-Origin-Opener-Policy",
        value: "same-origin",
    },
    {
        key: "Cross-Origin-Resource-Policy",
        value: "same-site",
    },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
    poweredByHeader: false,
    compress: true,
    reactStrictMode: true,

    async headers() {
        return [
            {
                source: "/:path*",
                headers: SECURITY_HEADERS,
            },
            {
                source: "/api/:path*",
                headers: [
                    ...SECURITY_HEADERS,
                    {
                        key: "Cache-Control",
                        value: "no-store, max-age=0",
                    },
                ],
            },
        ];
    },

    async rewrites() {
        if (!process.env.NEXT_PUBLIC_BASE_URL_CORE) return [];

        const upstreamBase = process.env.NEXT_PUBLIC_BASE_URL_CORE.replace(/\/$/, "");
        const upstreamHost = new URL(upstreamBase).hostname;
        if (!allowedRewriteDestination(upstreamHost)) {
            console.warn(
                `[next.config] rewrites deshabilitados: host "${upstreamHost}" no está en TRUSTED_PROXY_HOSTS`,
            );
            return [];
        }

        return [
            {
                source: "/core-api/:path*",
                destination: `${upstreamBase}/api/:path*`,
            },
        ];
    },

    images: {
        remotePatterns: [
            { protocol: "https", hostname: "wowlibre.com" },
            { protocol: "https", hostname: "www.wowlibre.com" },
            { protocol: "https", hostname: "api.wowlibre.com" },
            { protocol: "https", hostname: "static.wixstatic.com" },
            { protocol: "https", hostname: "wow.zamimg.com" },
            { protocol: "https", hostname: "i.imgur.com" },
            { protocol: "https", hostname: "media.giphy.com" },
            { protocol: "https", hostname: "encrypted-tbn0.gstatic.com" },
            { protocol: "https", hostname: "*.s3.us-east-1.amazonaws.com" },
        ],
        formats: ["image/avif", "image/webp"],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        minimumCacheTTL: 60,
    },

    experimental: {
        optimizePackageImports: [
            "react-icons",
            "@fortawesome/react-fontawesome",
            "@fortawesome/free-solid-svg-icons",
            "framer-motion",
            "react-chartjs-2",
            "chart.js",
        ],
    },
};

export default nextConfig;
