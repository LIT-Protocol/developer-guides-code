/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
        config.externals.push('pino-pretty');
        
        config.resolve.fallback = {
            ...config.resolve.fallback,
            net: false,
            tls: false,
            fs: false,
        };

        return config;
    },
};

export default nextConfig;
