/** @type {import('next').NextConfig} */
const nextConfig = {
    poweredByHeader: false,
    compress: true,
    reactStrictMode: true,

    images: {
        // Permite optimizar imágenes servidas desde estos dominios
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
    },

    experimental: {
        // Optimiza paquetes grandes en el cliente
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
