const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        "stream": require.resolve("stream-browserify"),
        "crypto": require.resolve("crypto-browserify"),
        "https": require.resolve("https-browserify"),
        "http": require.resolve("stream-http"),
        "assert": require.resolve("assert"),
        "url": require.resolve("url"),
        "util": require.resolve("util"),
        "buffer": require.resolve("buffer"),
        "process": require.resolve("process"),
        "zlib": require.resolve("browserify-zlib"),
      };

      webpackConfig.plugins = [
        ...webpackConfig.plugins,
        new webpack.ProvidePlugin({
          process: 'process',
          Buffer: ['buffer', 'Buffer'],
        }),
        new webpack.DefinePlugin({
          'process.env': JSON.stringify(process.env),
        }),
      ];

      return webpackConfig;
    },
  },
}; 