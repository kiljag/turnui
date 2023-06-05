/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    env: {
        WS_HOST: "ws://localhost:8080",
    },
    webpack: (config, { dev, isServer }) => {
        config.module.rules.push({
            test: /\.(ogg|mp3|wav|mpe?g)$/i,
            use: [
                {
                    loader: 'url-loader',
                    options: {
                        name: '[name]-[hash].[ext]',
                    },
                },
            ],
        });
        return config;
    },
}

module.exports = nextConfig
