const path = require("path");
const webpack = require("webpack");
const merge = require("webpack-merge");
const webpackConfigBase = require("./webpack.base.conf");
const appSrc = path.join(process.cwd(), "./src");
const PORT = process.env.port || 9001;

const webpackConfigDev = {
  mode: "development", // 通过 mode 声明开发环境
  output: {
    path: path.join(appSrc, "dist/"),
    // 打包多出口文件
    filename: "./js/[name].bundle.js"
  },
  devServer: {
    contentBase: path.join(appSrc, "/pages/**/*.html"),
    publicPath: "/",
    watchContentBase: true,
    host: "0.0.0.0",
    port: PORT,
    overlay: true, // 浏览器页面上显示错误
    open: true, // 开启浏览器
    // stats: "errors-only", //stats: "errors-only"表示只打印错误：
    hot: true, // 开启热更新
    before(app, server) {
      server._watch(path.join(appSrc, "pages/**/*.html"));
    }
  },
  plugins: [
    // 热更新
    new webpack.HotModuleReplacementPlugin()
  ],
  devtool: "source-map", // 开启调试模式
  module: {
    rules: []
  }
};
module.exports = merge(webpackConfigBase, webpackConfigDev);
