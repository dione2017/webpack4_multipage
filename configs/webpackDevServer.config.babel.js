import path from "path";
import { appPath, HOST, PORT } from "./env";

export default {
  contentBase: path.join(appPath, "./app/pages/**/*.html"),
  publicPath: "/",
  watchContentBase: true,
  host: HOST,
  port: PORT,
  overlay: true, // 浏览器页面上显示错误
  open: false, // 开启浏览器
  stats: "errors-only", //stats: "errors-only"表示只打印错误：
  hot: true, // 开启热更新
  before (app, server) {
    server._watch(path.join(appPath, "./app/pages/**/*.html"));
  }
}