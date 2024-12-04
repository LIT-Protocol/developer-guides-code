const webpack = require("webpack");

module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // Modify the rules
      webpackConfig.module.rules = webpackConfig.module.rules.map((rule) => {
        if (Array.isArray(rule.oneOf)) {
          rule.oneOf[rule.oneOf.length - 1].exclude = [
            /\.(js|mjs|jsx|cjs|ts|tsx)$/,
            /\.html$/,
            /\.json$/,
          ];
        }
        return rule;
      });

      // Add fallbacks
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        buffer: require.resolve("buffer/"),
        crypto: require.resolve("crypto-browserify"),
        stream: require.resolve("stream-browserify"),
        vm: require.resolve("vm-browserify"),
        process: require.resolve("process/browser"), // Adding process fallback
        http: false,
        https: false,
        zlib: false,
        url: false,
      };

      // Add ProvidePlugin to define process globally
      webpackConfig.plugins = [
        ...webpackConfig.plugins,
        new webpack.ProvidePlugin({
          process: "process/browser", // Ensures process is available in the browser
        }),
      ];

      return webpackConfig;
    },
  },
};
