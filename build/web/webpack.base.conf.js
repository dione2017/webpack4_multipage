const path = require("path");
const fs = require("fs");
const webpack = require("webpack");
const glob = require("glob");

const PurifyCssWebpack = require("purifycss-webpack"); // 消除冗余的css
const HtmlWebpackPlugin = require("html-webpack-plugin"); // html模板
const CopyWebpackPlugin = require("copy-webpack-plugin"); // 静态资源输出
const rules = require("./webpack.rules.conf.js");

const getHtmlConfig = function (name, chunks) {
  return {
    template: `./official_web/pages/${name}/${name}.html`,
    filename: `${name}.html`,
    favicon: './public/favicon.ico',
    // title: title,
    inject: true,
    hash: true, // 开启hash  ?[hash]
    chunks: chunks,
    minify: process.env.NODE_ENV === "development" ? false : {
      removeComments: true, // 移除HTML中的注释
      collapseWhitespace: true, // 折叠空白区域 也就是压缩代码
      removeAttributeQuotes: true // 去除属性引用
    }
  };
};

function getEntry () {
  let entry = {};
  glob.sync("./official_web/pages/**/*.js").forEach(function (fileDir) {
  	let pathObj = path.parse(fileDir)
  	let directoryName = pathObj.dir.match(/\/\w+$/g)[0].split("/")[1]
  	if (directoryName !== pathObj.name) {
  		throw new Error("filename must be named with the current directory name")
  	}
    entry[pathObj.name] = [fileDir];
  });
  return entry;
};

const entryObj = getEntry();
module.exports = {
  entry: entryObj,
  module: {
    rules: [...rules]
  },
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "official_web")
    }
  },
  externals: {
    // 'jquery': 'window.jQuery'
  },
  // 提取公共代码
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: { // 抽离第三方插件
          test: /node_modules/, // 指定是node_modules下的第三方包
          chunks: "initial",
          name: "vendor", // 打包后的文件名，任意命名
          // 设置优先级，防止和自定义的公共代码提取时被覆盖，不进行打包
          priority: 10
        },
        utils: { // 抽离自己写的公共代码，common这个名字可以随意起
          chunks: "initial",
          name: "common", // 任意命名
          minSize: 0, // 只要超出0字节就生成一个新包
          minChunks: 2
        }
      }
    }
  },
  plugins: [
    // 全局暴露统一入口
    new webpack.ProvidePlugin({

    }),
    // 静态资源输出
    new CopyWebpackPlugin([{
      from: path.resolve(process.cwd(), "official_web/assets"),
      to: "./assets",
      ignore: [".*"]
    }]),
    // 消除冗余的css代码
    new PurifyCssWebpack({
      paths: glob.sync(path.join(process.cwd(), "official_web/pages/*/*.html"))
    })

  ]
};

// 配置页面
const htmlArray = [];
Object.keys(entryObj).forEach(element => {
  htmlArray.push({
    _html: element,
    title: "",
    chunks: ["vendor", "common", element]
  });
});

// 自动生成html模板
htmlArray.forEach((element) => {
  module.exports.plugins.push(new HtmlWebpackPlugin(getHtmlConfig(element._html, element.chunks)));
});
