import { isProduction } from "./env";
import TerserWebpackPlugin from "terser-webpack-plugin";
import OptimizeCSSAssetsPlugin from "optimize-css-assets-webpack-plugin";

export default {
  splitChunks: {
    cacheGroups: {
      vendor: { // 抽离第三方插件
        test: /node_modules/, // 指定是node_modules下的第三方包
        chunks: "initial",
        name: "vendor", // 打包后的文件名，任意命名
        priority: 10, // 设置优先级，防止和自定义的公共代码提取时被覆盖，不进行打包
      },
      common: { // 抽离自己写的公共代码，common这个名字可以随意起
        chunks: "initial",
        name: "common", // 任意命名
        minSize: 10000, // 只要大小超出设置的这个数值，就生成一个新包
        minChunks: 2,
        priority: 9
      }
    }
  },
  minimizer: [
    isProduction && new TerserWebpackPlugin({}),
    isProduction && new OptimizeCSSAssetsPlugin({})
  ].filter(Boolean)
}