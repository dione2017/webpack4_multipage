const path = require("path");
const webpack = require("webpack");
const merge = require("webpack-merge");
const CleanWebpackPlugin = require("clean-webpack-plugin"); // 清除目录
const UglifyJSPlugin = require("uglifyjs-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const OptimizeCSSPlugin = require("optimize-css-assets-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const webpackConfigBase = require("./webpack.base.conf");

const webpackConfigProd = {
  mode: "production", // 通过 mode 声明生产环境
  output: {
    path: path.resolve(process.cwd(), "dist/"),
    // 打包多出口文件
    filename: "js/[name].[hash].js",
    publicPath: "./"
  },
  devtool: "source-map",
  optimization: {
    minimizer: [
      new UglifyJSPlugin({
        cache: true,
        parallel: true,
        sourceMap: false // set to true if you want JS source maps
      }),
      new OptimizeCSSPlugin({})
    ]
  },
  plugins: [
    new CleanWebpackPlugin(["dist/**/*"], {
      root: process.cwd(), // 根目录
      verbose: true, // 开启在控制台输出信息
      // dry Use boolean "true" to test/emulate delete. (will not remove files).
      // Default: false - remove files
      dry: false
    }),
    // 分离css插件参数为提取出去的路径
    new ExtractTextPlugin({
      filename: "css/[name].[hash:8].min.css"
    }),
    // 压缩css
    new OptimizeCSSPlugin({
      cssProcessorOptions: {
        safe: true
      }
    }),
    // 上线压缩 去除console等信息webpack4.x之后去除了webpack.optimize.UglifyJsPlugin
    new UglifyJSPlugin({
      uglifyOptions: {
        compress: {
          warnings: false,
          drop_debugger: false,
          drop_console: true
        }
      }
    })
  ],
  module: {
    rules: []
  }
};

module.exports = merge(webpackConfigBase, webpackConfigProd);
