const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin")
module.exports = {
    configureWebpack: {
      // It will be merged into the final Webpack config
      plugins: [
        new MonacoWebpackPlugin({
            languages: ["markdown"]
        })
      ]
    }
  }