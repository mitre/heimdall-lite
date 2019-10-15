let HtmlWebpackPlugin = require("html-webpack-plugin");
let HtmlWebpackInlineSourcePlugin = require("html-webpack-inline-source-plugin");
var webpack = require("webpack");

// Lookup constants
const fs = require("fs");
const packageJson = fs.readFileSync("./package.json");
const parsed = JSON.parse(packageJson);
const version = parsed.version || 0;
const description = parsed.description || "";
const repository = parsed.repository.url || "";
const license = parsed.license || "";

module.exports = {
  publicPath: process.env.NODE_ENV === "production" ? "./" : "/",
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        "process.env": {
          PACKAGE_VERSION: '"' + version + '"',
          DESCRIPTION: '"' + description + '"',
          REPOSITORY: '"' + repository + '"',
          LICENSE: '"' + license + '"'
        }
      }),
      new HtmlWebpackPlugin({
        template: "public/index.html",
        inlineSource: ".(js|css)$"
      }),
      new HtmlWebpackInlineSourcePlugin()
    ]
  },
  css: {
    loaderOptions: {
      sass: {
        data: `@import "~@/sass/main.scss"`
      }
    }
  },
  chainWebpack: config => {
    ["vue-modules", "vue", "normal-modules", "normal"].forEach(match => {
      config.module
        .rule("scss")
        .oneOf(match)
        .use("sass-loader")
        .tap(opt =>
          Object.assign(opt, { data: `@import '~@/sass/main.scss';` })
        );
    });
  }
};
