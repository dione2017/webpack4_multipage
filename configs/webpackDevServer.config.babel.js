import path from "path";
import { appPath } from "./env";

export default {
  contentBase: path.resolve(appPath, "pages/**/*.html"),
  publicPath: "/",
  watchContentBase: true,
  overlay: true, // 浏览器页面上显示错误
  open: false, // 开启浏览器
  stats: "errors-only", //stats: "errors-only"表示只打印错误：
  hot: true, // 开启热更新
  before (app, server) {
    server._watch(path.resolve(appPath, "pages/**/*.html"));
  }
}