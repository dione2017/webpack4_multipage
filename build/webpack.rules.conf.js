const extractTextPlugin = require("extract-text-webpack-plugin");
const friendlyFormatter = require("eslint-formatter-friendly");
const rules = [{
    test: /\.(css|scss|sass)$/,
    // 不分离的写法
    // use: ["style-loader", "css-loader",sass-loader"]
    // 使用postcss不分离的写法
    // use: ["style-loader", "css-loader", "sass-loader","postcss-loader"]
    // 此处为分离css的写法
    /* use: extractTextPlugin.extract({
        fallback: "style-loader",
        use: ["css-loader", "sass-loader"],
        // css中的基础路径
        publicPath: "../"
      }) */
    // 区别开发环境和生成环境
    use: process.env.NODE_ENV === "development" ? ["style-loader", "css-loader", "sass-loader", "postcss-loader"] : extractTextPlugin.extract({
      fallback: "style-loader",
      use: ["css-loader", "sass-loader", "postcss-loader"],
      // css中的基础路径
      publicPath: "../"

    })
  }, { // To be safe, you can use enforce: "pre" section to check source files, not modified by other loaders (like babel-loader)
    enforce: "pre",
    test: /\.js$/,
    exclude: /node_modules/,
    loader: "eslint-loader",
    options: {
      formatter: friendlyFormatter
    }
  },
  {
    test: /\.js$/,
    use: ["babel-loader"],
    exclude: "/node_modules/"
  }, {
    test: /\.(png|jpg|gif)$/,
    use: [{
      loader: "url-loader",
      options: {
        limit: 8 * 1024, // 小于这个时将会已base64位图片打包处理
        outputPath: "images"
      }
    }]
  },
  {
    test: /\.(woff2?|eot|ttf|otf|svg)(\?.*)?$/,
    loader: "url-loader",
    options: {
      limit: 10000
    }
  },
  {
    test: /\.html$/,
    use: ["html-withimg-loader"] // html中的img标签
  }, {
    test: /\.less$/,
    // 三个loader的顺序不能变
    // 不分离的写法
    // use: ["style-loader", "css-loader", "less-loader"]
    // 区别开发环境和生成环境
    use: process.env.NODE_ENV === "development" ? ["style-loader", "css-loader", "less-loader"] : extractTextPlugin.extract({
      fallback: "style-loader",
      use: ["css-loader", "less-loader"],
      // css中的基础路径
      publicPath: "../"
    })
  }
];
module.exports = rules;
