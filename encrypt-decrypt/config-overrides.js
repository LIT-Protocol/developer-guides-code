const webpack = require('webpack'); // Import webpack

module.exports = {
    webpack: function(config, env) {
        // Add a fallback for 'crypto' in the resolve object
        config.resolve = {
            ...config.resolve, // Spread existing resolve configurations
            fallback: {
                ...config.resolve.fallback, // Spread existing fallbacks, if any
                'crypto': require.resolve('crypto-browserify'), // Fallback for 'crypto'
                'stream': require.resolve('stream-browserify'), // Fallback for 'stream'
                'buffer': require.resolve('buffer/'), // Add this line
                'http': require.resolve('stream-http'), // Add this line
                'https': require.resolve('https-browserify'), // Add this line
                'url': require.resolve('url/'), // Add this line
                'zlib': require.resolve('browserify-zlib'), // Add this line
                'assert': require.resolve('assert/'), // Add this line
            },
        };

        // Provide plugin to define Buffer globally
        config.plugins = [
            ...config.plugins,
            new webpack.ProvidePlugin({
                Buffer: ['buffer', 'Buffer'],
            }),
        ];

        config.module.rules = config.module.rules.map(rule => {
            if (rule.oneOf instanceof Array) {
                rule.oneOf[rule.oneOf.length - 1].exclude = [
                    /\.(js|mjs|jsx|cjs|ts|tsx)$/,
                    /\.html$/,
                    /\.json$/,
                ];
            }
            return rule;
        });
        return config;
    },
}; 