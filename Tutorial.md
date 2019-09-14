本文将从以下几个方面逐步讲解：<br>
* mpa项目目录结构
* 最简单的多页入口配置
* 脚本自动生成多页入口配置。
* 常用loader配置
* 公共代码拆分 && 打包构建优化。
* 利用contentHash做持久化缓存
## 项目目录结构
新建一个文件夹，名字随意，假设命名为webpack-mpa。然后定位到该目录，执行命令 `npm init`, 基本上一路回车就好，按照下面的目录结构把app里面的文件夹建好。开发源代码放于app子目录，app目录下的assets为项目所需资源，**pages目录为本应用的核心：多入口**，configs目录下面存放webpack配置文件，dist为打包输出目录，scripts为启动和打包脚本存放目录，其他的就不一一介绍了，前端同学基本上一看就懂。
```
├── README.md
├── app // 开发源代码目录
│   ├── assets // 资源目录
│   │   ├── images
│   │   └── styles
│   │       ├── common.less
│   └── pages // 多页面入口目录
│       ├── entry1
│       │   ├── index.html
│       │   ├── index.js
│       │   ├── index.less
│       └── entry2
│           ├── index.html
│           ├── index.js
│           └── index.less
├── configs // webpack配置文件目录
│   ├── env.js
│   ├── module.js
│   ├── optimization.js
│   ├── plugins.js
│   ├── webpack.config.babel.js
│   └── webpackDevServer.config.babel.js
├── dist // 打包输出目录
├── package.json
├── scripts // 启动和打包脚本
│   ├── build.js
│   ├── devServer.js
│   └── start.js
├── yarn-error.log
├── yarn.lock
```

## 最简单的多页入口配置
### 项目启动准备
从webpack4开始，配置文件以为xxx.babel.js结尾的，可以直接使用es6 module语法，但是需要安装@babel/register @babel/core @babel/reset-env。另外添加cross-env插件，可以跨平台设置环境变量。
```
yarn add webpack webpack-cli cross-env @babel/register @babel/core @babel/preset-env --dev
```
基本依赖添加完毕之后，在根目录下创建.babelrc文件

.babelrc
```
{
  "presets": [
    [
      "@babel/preset-env"
    ]
  ]
}
```
在configs目录下新建一个webpack.config.babel.js文件。

webpack.config.babel.js
```javascript
import path from "path";

const { NODE_ENV } = process.env;
export default {
  target: "web", // 构建的项目运行平台。有web electron node等可选
  mode: NODE_ENV // webpack运行模式，默认为production
}
```
### entry

[webpack entry](https://webpack.js.org/concepts/entry-points)有三种写法：对象、字符串、数组。本示例采用对象写法。
在webpack.config.babel.js添加入口配置：
```javascript
entry: {
  entry1: path.resolve(__dirname, "../app/pages/entry1/index.js"), // 入口文件1
  entry2: path.resolve(__dirname, "../app/pages/entry2/index.js") // 入口文件2
}
```

### output
多页应用中，不太可能把所有的入口文件打包到一个输出文件中，所以我们需要根据对应的入口文件，单独打包成对应的输出文件。

在webpack.config.babel.js添加打包输出配置：
```javascript
output: {
  path: path.resolve(__dirname, "../dist"),
  filename: "[name].js"
}
```
filename中的[name]是一个chunk通配符，chunk可以简单的理解为入口文件名，一个入口文件就是一个chunk。本示例中有两个chunk：entry1和entry2。
故打包之后输出的文件为：entry1.js、entry2.js。

现在我们的webpack.config.babel.js变成了这样
```
import path from "path";

const { NODE_ENV } = process.env;
export default {
  target: "web",
  mode: NODE_ENV,
  entry: {
    entry1: path.resolve(__dirname, "../app/pages/entry1/index.js"),
    entry2: path.resolve(__dirname, "../app/pages/entry2/index.js")
  },
  output: {
    path: path.resolve(__dirname, "../dist"),
    filename: "[name].js"
  }
}
```
为了方便，在package.json中添加scripts脚本命令
```
"build": "cross-env NODE_ENV=production webpack --config configs/webpack.config.babel.js"
```
此时可以运行`npm run build`打包命令，得到如下类似的输出结果：
```
Hash: 29c9e7c031516faa1d3e
Version: webpack 4.40.2
Time: 63ms
Built at: 2019-09-14 20:38:15
    Asset       Size  Chunks             Chunk Names
entry1.js  972 bytes       0  [emitted]  entry1
entry2.js  973 bytes       1  [emitted]  entry2
Entrypoint entry1 = entry1.js
Entrypoint entry2 = entry2.js
[0] ./app/pages/entry1/index.js 57 bytes {0} [built]
[1] ./app/pages/entry2/index.js 56 bytes {1} [built]
```
可以看到入口chunk两个，打包之后输出名也是入口chunk名。输出目录为根目录下面的dist。
### 添加html模板文件
以上的示例仅仅是打包入口js文件，接下来添加html模板，把入口文件注入到对应的html模板文件中，这需要用到 [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin) 插件。

先安装插件
```
yarn add html-webpack-plugin clean-webpack-plugin progress-bar-webpack-plugin --dev
```
把所有的配置都写在webpack.config.babel.js中，会格外庞大，把webpack的plugin module optimization等拆分出来比较容易管理。在configs目录下面新建文件plugin.js，每次打包时候用clean-webpack-plugin清除dist目录，progress-bar-webpack-plugin用于显示构建进度。

plugin.js
```
import path from "path";

import HtmlWebpackPlugin from "html-webpack-plugin";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import ProgressBarPlugin from "progress-bar-webpack-plugin";
const plugins = [
  new CleanWebpackPlugin(),
  new ProgressBarPlugin(),
  new HtmlWebpackPlugin({
    template: path.resolve(__dirname, "../app/pages/entry1/index.html"),
    filename: `entry1.html`,
    chunks: ["entry1"]
  }),
  new HtmlWebpackPlugin({
    template: path.resolve(__dirname, "../app/pages/entry2/index.html"),
    filename: `entry2.html`,
    chunks: ["entry2"]
  })
]

export default [...plugins];
```
ok，最简单的例子完成了。多页面应用基本原理就是添加多个入口和打包输出多个出口。这个示例中，我们是手动添加entry入口文件和模板的，如果页面多了之后，webpack配置代码将变的特别多，而且每次添加新页面之后就要去改配置，变的十分不方便。下一小节 脚本自动生成多页入口配置 将解决这个问题。

## 脚本自动生成多页入口配置
自动生成多入口配置关键在于**按照规定的目录结构动态扫描所有入口文件生成入口配置，同时生成html模板插件配置**。由于多次用到读取app目录，在configs目录下面新建一个env.js文件，用于存放多次用到的变量，并预定义一些变量。

env.js
```
import path from "path";

export const { NODE_ENV, BUNDLE_ANNALYZE } = process.env;
export const isDevelopment = NODE_ENV === "development";
export const isProduction = NODE_ENV === "production";
export const shouldUseSourceMap = true
export const PORT = process.env.port || 9001;
export const PROTOCOL = process.env.HTTPS === 'true' ? 'https' : 'http';
export const HOST = "127.0.0.1";
export const appPath = path.join(process.cwd(), "./app");
export const isBundleAnalyze = BUNDLE_ANNALYZE === "analyze";
```
自动生成多页入口配置主逻辑

plugins.js
```
import path from "path";
import fs from "fs";
import glob from "glob";
import HtmlWebpackPlugin from "html-webpack-plugin";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import ProgressBarPlugin from "progress-bar-webpack-plugin";

import {
  appPath,
} from "./env";

function getEntry () {
  let entry = {};
  glob.sync(path.resolve(appPath, "pages/**/index.js"))
    .forEach(function (fileDir) {
      let pathObj = path.parse(fileDir);
      // 用文件夹名字作为入口名。
      let entryName = pathObj.dir.match(/\/\w+$/g)[0].split("/")[1];
      entry[entryName] = fileDir;
    });
  return entry;
};

const entry = getEntry();

const plugins = [
  new CleanWebpackPlugin(),
  new ProgressBarPlugin()
];

function getHtmlWebpackPluginConfigs () {
  const res = [];
  for (let [entryName] of Object.entries(entry)) {
    const htmlFilePath = `${appPath}/pages/${entryName}/index.html`;
    if (!fs.existsSync(htmlFilePath)) {
      throw new Error(`file: ${htmlFilePath} not exist`);
    }
    const plugin = new HtmlWebpackPlugin({
      template: htmlFilePath,
      filename: `${entryName}.html`,
      chunks: [entryName]
    });
    res.push(plugin);
  }
  return res;
}

export { entry };
export default [...plugins, ...getHtmlWebpackPluginConfigs()];
```
修改之后的webpack.config.babel.js
```
import path from "path";
import plugins, { entry } from "./plugins";

const { NODE_ENV } = process.env;

export default {
  target: "web",
  mode: NODE_ENV,
  entry,
  output: {
    path: path.resolve(__dirname, "../dist"),
    filename: "[name].js"
  },
  plugins
}
```
getEntry函数中用glob插件扫描app目录下的pages目录下面的index.js，并且把包含indexjs的目录作为入口名，得到一个entry配置，然后getHtmlWebpackPluginConfigs函数遍历所有的entry配置，生成html模板插件配置。这种扫描规则要求所有的页面入口都在pages第一级目录，以文件夹形式存在，文件夹名作为入口配置名，下面必须包含index.js和index.html为真正的入口文件和html模板文件。

在pages目录下面新建文件entry3，里面新建index.html和index.js，执行```npm run build```可以看到dist目录中已经有了三个html和三个js文件。
```
dist
├── entry1.html
├── entry1.js
├── entry2.html
├── entry2.js
├── entry3.html
└── entry3.js
```

当然了，目录的规则和扫描的规则，按照每个人和具体项目的情况，可以自行定义修改。至此，webpack多页应用的大体框架已经搭建好了，一定要理解webpack的entry和output思想，然后动态扫描文件作为入口，**重在思想**。

## es2015+ 环境配置
webpack最强大的地方就是各种插件和lodaer了(其实这也是最恶心的地方~~~)。不同的人和项目，需要根据实际需求配置，在此列举一些基础loader配置。

在configs.js中新建module.js，并写入一些常见loader基础配置

module.js
```
import {
  appPath,
  isDevelopment,
  isProduction,
  shouldUseSourceMap
} from "./env";
import PostCssPresetEnv from "postcss-preset-env";
import PostcssFlexBugsfixes from "postcss-flexbugs-fixes";
import friendlyFormatter from "eslint-formatter-friendly"

const postCssLoaderConfig = {
  loader: "postcss-loader",
  options: {
    ident: 'postcss',
    plugins: () => [
      PostcssFlexBugsfixes,
      PostCssPresetEnv({
        autoprefixer: {
          flexbox: 'no-2009',
          overrideBrowserslist: [
            "last 100 version"
          ]
        },
        stage: 3,
      })
    ],
    sourceMap: isProduction && shouldUseSourceMap,
  },
}
export default {
  rules: [
    { // 这个要先与babel-loader之前定义
      enforce: "pre",
      test: /\.js$/,
      exclude: /node_modules/,
      loader: "eslint-loader",
      options: {
        formatter: friendlyFormatter
      }
    }, {
      test: /\.js$/,
      include: appPath,
      use: "babel-loader"
    }, {
      test: /\.css$/,
      use: [
        isDevelopment && "style-loader",
        "css-loader",
        postCssLoaderConfig
      ].filter(Boolean)
    }, {
      test: /\.less$/,
      include: appPath,
      use: [
        isDevelopment && "style-loader",
        "css-loader",
        "less-loader",
        postCssLoaderConfig
      ].filter(Boolean)
    }, {
      test: /\.(png\jpe?g|gif)$/,
      use: ["file-loader"]
    }, {
      test: /\.(png|jpg|gif)$/,
      use: [{
        loader: "url-loader",
        options: {
          limit: 8 * 1024, // 小于这个时将会已base64位图片打包处理
          outputPath: "images"
        }
      }]
    }, {
      test: /\.(woff2?|eot|ttf|otf|svg)(\?.*)?$/,
      loader: "url-loader",
      options: {
        limit: 10000
      }
    }, {
      test: /\.html$/,
      use: ["html-withimg-loader"] // html中的img标签
    }
  ]
}
```
同时添加.eslintrc.js
```
module.exports = {
  "env": {
    "browser": true,
    "commonjs": true,
    "es6": true
  },
  "extends": "standard", 
  "parserOptions": {
    "sourceType": "module"
  },
  "rules": {
    "indent": ["error", 2],
    "linebreak-style": ["error", "unix"],
    "quotes": ["error", "double"],
    "semi": ["error", "always"],
    "import/no-duplicates": [0]
  }
};
```
以及修改.babelrc
```
{
  "presets": [
    [
      "@babel/preset-env", {
        "corejs": 3,
        "targets": {
          "browsers": "> 0.25%"
        },
        "useBuiltIns": "usage"
      }
    ]
  ],
  "plugins": [
    ["@babel/plugin-transform-runtime"]
  ]
}
```
loader实在是太多了也太复杂了，需要装的插件也太多了，可以参考我的github里面的[package.json](https://github.com/dione2017/webpack4_multipage/blob/master/package.json)，把所有的插件copy过来准没错。各种插件具体配置略过，官方教程非常好。

## 公共代码拆分 && 打包构建优化
为了项目方便，现在webpack.config.babel.js添加resolve配置
```
resolve: {
  extensions: [".js", ".css", ".less", ".json"],
  alias: {
    "@": appPath,
  }
}
```
现在我们在entry1和entry2下面的js都加上如下代码
```
import _ from "lodash";
import $ from "jquery";
import "reset.css";
import "bootstrap/dist/css/bootstrap.min.css";

console.log(_, $);
async function test () {
  console.log("start");
}
test();
```
webpack4里面的opimization配置，顾名思义就是优化的意思，里面真是大有文章啊，webpack4比起1、2、3真是进步明显。
新建一个optimization.js
```
import { isProduction, shouldUseSourceMap } from "./env";
import TerserWebpackPlugin from "terser-webpack-plugin";

export default {
  minimizer: [
    // This is only used in production mode
    isProduction && new TerserWebpackPlugin({
      // Use multi-process parallel running to improve the build speed
      // Default number of concurrent runs: os.cpus().length - 1
      parallel: false,
      // Enable file caching
      cache: false,
      sourceMap: shouldUseSourceMap,
    }),
  ].filter(Boolean)
}
```
现在的optimization.js还非常简单，只是加入了一个压缩插件。从现在开始我们不仅要拆分代码，每一步优化之后打包都查看打包时间，分秒必争，做好最大的构建优化。开始第一次打包统计：
```
Build completed in 6.304s
Hash: 74a31df5d396423a4b19
Version: webpack 4.40.2
```

特此说明：我的电脑是macos 10.13.6系统，cpu为intel i7 8700(比白苹果还好用的黑苹果)，每个人的电脑cpu，内存、系统等不同，结果仅供参考，以自己每次构建优化之后时间减少的百分比为主就行了。

### 启用多核心压缩js
TerserWebpackPlugin插件中 `parallel` 参数表示是否开始多线程，默认设置是cpu线程数减1，现在把它设置为true。继续打包：
```
Build completed in 4.185s
Hash: 74a31df5d396423a4b19
Version: webpack 4.40.2
```
提升可观啊...
### 开启缓存
TerserWebpackPlugin插件中 `cache` 表示是否开启缓存，如果下次build过程中，发现有未更改的chunk，则会直接读取缓存，减少重复打包节省时间。设置为true继续打包：
```
Build completed in 1.887s
Hash: 74a31df5d396423a4b19
Version: webpack 4.40.2
```
注意开启缓存之后，第一次打包还是和之前的一样是4.2s左右，因为之前没有开启缓存，故没有缓存可以读取，第二次再打包，有缓存可以读取，时间大大减少。

### 代码拆分
根据之前的打包结果，查看dist目录得到如下:
```
-rw-r--r--  1 lijialin  staff   296B  9 14 23:25 entry1.html
-rw-r--r--  1 lijialin  staff   372K  9 14 23:25 entry1.js
-rw-r--r--  1 lijialin  staff   296B  9 14 23:25 entry2.html
-rw-r--r--  1 lijialin  staff   372K  9 14 23:25 entry2.js
-rw-r--r--  1 lijialin  staff   296B  9 14 23:25 entry3.html
-rw-r--r--  1 lijialin  staff   955B  9 14 23:25 entry3.js
```
仔细观察发现entry1.js和entry2.js的js文件非常大，两个都包含了jquery和lodash，以及reset.css和bootstrap.css。现在需要做两件事儿：
* 抽离公共代码
* css分离打包

webpack4之前用CommonsChunkPlugin抽取公众代码，该插件已经从webpack4中移除，新版本用SplitChunksPlugin做拆分，这是一个webpack自带的优化选项配置optimization下面的一个属性。

optimization.js
```
import { isProduction, shouldUseSourceMap } from "./env";
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
        chunks: "all",
        name: "common", // 任意命名
        minSize: 0, // 只要大小超出设置的这个数值，就生成一个新包
        minChunks: 2,
        priority: 9
      }
    }
  },
  minimizer: [
    // This is only used in production mode
    isProduction && new TerserWebpackPlugin({
      // Use multi-process parallel running to improve the build speed
      // Default number of concurrent runs: os.cpus().length - 1
      parallel: true,
      // Enable file caching
      cache: true,
      sourceMap: shouldUseSourceMap,
    }),
    // This is only used in production mode
    isProduction && new OptimizeCSSAssetsPlugin({
      cssProcessorOptions: {
        map: shouldUseSourceMap
          ? {
              inline: false,
              // `annotation: true` appends the sourceMappingURL to the end of
              // the css file, helping the browser find the sourcemap
              annotation: true,
            }
          : false,
      },
    }),
  ].filter(Boolean)
}
```
module.js中在css和less的loader里面修改以下配置，修改之后部分代码如下：
```
{
  test: /\.css$/,
  use: [
    isDevelopment && "style-loader",
    isProduction && {
      loader: MiniCssExtractPlugin.loader,
      options: {
        publicPath: "../"
      }
    },
    "css-loader",
    postCssLoaderConfig
  ].filter(Boolean)
}, {
  test: /\.less$/,
  include: appPath,
  use: [
    isDevelopment && "style-loader",
    isProduction && {
      loader: MiniCssExtractPlugin.loader,
      options: {
        publicPath: "../"
      }
    },
    "css-loader",
    "less-loader",
    postCssLoaderConfig
  ].filter(Boolean)
}
```
同时修改plugins，添加MiniCssExtractPlugin：
```
const plugins = [
  new CleanWebpackPlugin(),
  new ProgressBarPlugin(),
  isProduction && new MiniCssExtractPlugin({
    filename: 'css/[name].css',
    chunkFilename: 'css/[id].css'
  }),
].filter(Boolean);
```
在这儿我们做了两件重要的事儿，第一就是拆分代码，把公共的css js拆分到一个文件中，第二就是在拆分的公共文件中提取公共css。
有关webpack4 [splitChunks](https://webpack.js.org/plugins/split-chunks-plugin/)的具体规则，官网介绍的比较好。

在app的assets目录下面新建一个common.less，随便写点代码，然后entry1和entry2同时引入这个less文件

再次打包，打包之后dist目录长这样：
```
-rw-r--r--  1 lijialin  staff   111B  9 15 00:42 0.css
-rw-r--r--  1 lijialin  staff   388B  9 15 00:42 0.css.map
-rw-r--r--  1 lijialin  staff   206K  9 15 00:42 1.css
-rw-r--r--  1 lijialin  staff   286K  9 15 00:42 1.css.map
-rw-r--r--  1 lijialin  staff    80B  9 15 00:42 common.js
-rw-r--r--  1 lijialin  staff   296B  9 15 00:42 entry1.html
-rw-r--r--  1 lijialin  staff   1.9K  9 15 00:42 entry1.js
-rw-r--r--  1 lijialin  staff   296B  9 15 00:42 entry2.html
-rw-r--r--  1 lijialin  staff   1.9K  9 15 00:42 entry2.js
-rw-r--r--  1 lijialin  staff   296B  9 15 00:42 entry3.html
-rw-r--r--  1 lijialin  staff   955B  9 15 00:42 entry3.js
-rw-r--r--  1 lijialin  staff   160K  9 15 00:42 vendor.js
```
公共的js和css已经被单独拆分出来了。0.css是我们写的common.less里面的内容，虽然很小，但是也被拆分出来了，是通过splitchunks里面的minSize控制的。1.css是reset.css和bootstrap.css的合并，因为都在node_modules中，所以被打包成了一个文件。vender.js则包含了jquery和lodash，以及babel runtime转化的部分代码。提醒：**webpack4的splitchunk是个很重要的东西，一定要去好好的学习**。

修改配置文件之后连续打包两次，第二次可以读取缓存，打包信息：
```
Build completed in 2.86s
Hash: 2449ed9d5b9e289f3001
Version: webpack 4.40.2
```
时间变长了，拆分代码，必然的会有额外的开销。如果我们把TerserWebpackPlugin中的cache和parallel都设置为false，再试试？
```
Build completed in 5.31s
Hash: 2449ed9d5b9e289f3001
Version: webpack 4.40.2
```
可见开启缓存和多核心提升非常大的，毕竟实际业务中，大多时候变的是业务代码，少数时候变的是自己的公共代码，极少时候三方库才会变化比如版本更新。
### 抽离三方库为cdn
我们以bootcdn为三方cdn例子介绍。
分别在entry1和entry2的index.html中添加
```
  <link href="https://cdn.bootcss.com/twitter-bootstrap/4.3.1/css/bootstrap.min.css" rel="stylesheet">
  <script src="https://cdn.bootcss.com/jquery/2.2.4/jquery.min.js"></script>
```
index.js中取消对bootstrap.css的引用，webpack.config.babael.js添加external外部依赖
```
externals: {
  jquery: "jQuery"
}
```
修改配置文件之后连续打包两次，第二次可以读取缓存，打包信息：
```
Build completed in 2.302s
Hash: 15ae6682578c7c9e04e8
Version: webpack 4.40.2
```
嗯，减少了0.5s，还是不错了，越往后越难优化了... 查看以下dist目录现在长啥样儿：
```
-rw-r--r--  1 lijialin  staff   111B  9 15 01:00 0.css
-rw-r--r--  1 lijialin  staff   388B  9 15 01:00 0.css.map
-rw-r--r--  1 lijialin  staff   807B  9 15 01:00 1.css
-rw-r--r--  1 lijialin  staff   1.5K  9 15 01:00 1.css.map
-rw-r--r--  1 lijialin  staff    80B  9 15 01:00 common.js
-rw-r--r--  1 lijialin  staff   472B  9 15 01:00 entry1.html
-rw-r--r--  1 lijialin  staff   1.9K  9 15 01:00 entry1.js
-rw-r--r--  1 lijialin  staff   472B  9 15 01:00 entry2.html
-rw-r--r--  1 lijialin  staff   1.9K  9 15 01:00 entry2.js
-rw-r--r--  1 lijialin  staff   296B  9 15 01:00 entry3.html
-rw-r--r--  1 lijialin  staff   955B  9 15 01:00 entry3.js
-rw-r--r--  1 lijialin  staff    76K  9 15 01:00 vendor.js
```
jquery被抽离出去用cdn加载后，vender体积大量减少，由于我们的业务文件几乎没啥代码，@babel/tranform-runtime插件所需的代码必然也很少，故可以断定基本都是lodash的代码。实际开发中，也不可能引用整个lodash，比如我们用到clonedeep，那么就单独引用它。lodash提供了一个es版本，终于可以按需加载了。
```
import { cloneDeep } from "lodash-es";
...
console.log(cloneDeep, $);
...
test();
```
改一下entry1和entry2中的代码，再次打包
```
Build completed in 1.718s
Hash: ece442821ba575310bbd
Version: webpack 4.40.2
```
dist文件
```
-rw-r--r--  1 lijialin  staff   111B  9 15 01:13 0.css
-rw-r--r--  1 lijialin  staff   388B  9 15 01:13 0.css.map
-rw-r--r--  1 lijialin  staff   807B  9 15 01:13 1.css
-rw-r--r--  1 lijialin  staff   1.5K  9 15 01:13 1.css.map
-rw-r--r--  1 lijialin  staff    81B  9 15 01:13 common.js
-rw-r--r--  1 lijialin  staff   472B  9 15 01:13 entry1.html
-rw-r--r--  1 lijialin  staff   1.9K  9 15 01:13 entry1.js
-rw-r--r--  1 lijialin  staff   472B  9 15 01:13 entry2.html
-rw-r--r--  1 lijialin  staff   1.9K  9 15 01:13 entry2.js
-rw-r--r--  1 lijialin  staff   296B  9 15 01:13 entry3.html
-rw-r--r--  1 lijialin  staff   955B  9 15 01:13 entry3.js
-rw-r--r--  1 lijialin  staff    20K  9 15 01:13 vendor.js
```
时间再次减少，并且vender.js公共依赖体积大大减少。至此，一个引用jquery lodash bootstrap的多页面demo打包构建优化到1.7s左右，具体每个人电脑配置不同所需时间不同，就算后面再加上一些组件库，写n多业务代码(只要不瞎写)，只要合理的运用三方cdn，抽离node_modules公共资源，建立缓存，我估计应该也不会超过10s的构建时间，好，就算10s不够，翻个倍20s吧，也不算很长，比起一些瞎搞的项目动则打包以分钟为计，也是挺不错的...

## 持久化缓存
以上的每次打包输出都是直接用的entry名字，没有带版本号，实际生产中肯定是行不通的。

我们把webpack.config.babel.js中的output输出稍微改一下：
```
...
  output: {
    filename: isDevelopment ? "js/[name].bundle.js" : "js/[name].[contentHash:8].js",
    path: isProduction ? path.resolve(__dirname, "../dist") : undefined
  }
...
```
抽离输出的css插件也改以下：
plugins.js部分代码
```
...
const plugins = [
  new CleanWebpackPlugin(),
  new ProgressBarPlugin(),
  isDevelopment && new webpack.HotModuleReplacementPlugin(),
  isProduction && new MiniCssExtractPlugin({
    filename: 'css/[name].[contentHash:8].css',
    chunkFilename: 'css/[id].[contentHash:8].css'
  })
].filter(Boolean);
...
```
contentHash是以内容生成的，有点类似文件的md5，只要内容不变，hash就不会变，也就是内容没变的情况下，输出的文件名是一样的，这样有利于我们项目做持久化缓存。
最后别忘了在HtmlWebpackPlugin中把splitChunks拆分的chunks加上，也就是common和vender。

plugins.js部分代码
```
...
function getHtmlWebpackPluginConfigs () {
  const res = [];
  for (let [entryName] of Object.entries(entry)) {
    const htmlFilePath = `${appPath}/pages/${entryName}/index.html`;
    if (!fs.existsSync(htmlFilePath)) {
      throw new Error(`file: ${htmlFilePath} not exist`);
    }
    const plugin = new HtmlWebpackPlugin({
      template: htmlFilePath,
      filename: `${entryName}.html`,
      chunks: ["vendor", "common", entryName]
    });
    res.push(plugin);
  }
  return res;
}
...
```
### 完结
文笔不好，敬请谅解。本教程重在讲解思路，欢迎指出错误之处和给出宝贵意见。