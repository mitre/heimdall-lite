let HtmlWebpackPlugin = require("html-webpack-plugin");
let HtmlWebpackInlineSourcePlugin = require("html-webpack-inline-source-plugin");
module.exports = {
  publicPath: process.env.NODE_ENV === "production" ? "./" : "/",
  configureWebpack: {
    plugins: [
      new HtmlWebpackPlugin({
        template: "public/index.html",
        inlineSource: ".(js|css)$"
      }),
      new HtmlWebpackInlineSourcePlugin()
    ]
  }
};
