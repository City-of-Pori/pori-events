module.exports = {
    webpack: {
      configure: {
        output: {
          filename: 'static/js/app-bundle.js',
          publicPath: "/themes/custom/pori_events/dist/searchkit-v3/build/"
        },
        // optimization: {
        //   runtimeChunk: false,
        //   splitChunks: {
        //     chunks(chunk) {
        //       return false
        //     },
        //   },
        // },
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