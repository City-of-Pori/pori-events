module.exports = {
    webpack: {
      configure: {
        output: {
          filename: 'static/js/app-bundle.js'
        },
        optimization: {
          runtimeChunk: false,
          splitChunks: {
            chunks(chunk) {
              return false
            },
          },
        },
      },
    },
    plugins: [
      {
        plugin: {
          overrideWebpackConfig: ({ webpackConfig }) => {
            webpackConfig.plugins[5].options.filename = 'static/css/app-bundle.css';
            return webpackConfig;
          },
        },
        options: {}
      }
    ],
  }