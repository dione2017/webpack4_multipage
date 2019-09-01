import path from "path";
import { NODE_ENV, isDevelopment, isProduction, appPath } from "./env";
import optimization from "./optimization";
import module from "./module";
import plugins, { entry } from "./plugins";

export default  {
  target: "web",
  devtool: "source-map",
  mode: NODE_ENV,
  entry,
  output: {
    filename: isDevelopment ? "js/[name].bundle.js" : "js/[name].[contentHash:8].js",
    path: isProduction ? path.resolve(__dirname, "../dist") : undefined
  },
  resolve: {
    extensions: [".js", ".css", ".less", ".json"],
    alias: {
      "@": appPath,
    },
  },
  optimization,
  module,
  plugins
}
