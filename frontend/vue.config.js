const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin
const webpack = require("webpack")
module.exports = {
    configureWebpack: {
      // It will be merged into the final Webpack config
      plugins: [
        // new BundleAnalyzerPlugin(),
        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
      ]
    }
  }