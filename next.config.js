/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    env: {
        WS_HOST: "ws://localhost:8080",
    }
}

module.exports = nextConfig
