import {
  appPath,
  isDevelopment,
  isProduction,
  shouldUseSourceMap
} from "./env";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import PostCssPresetEnv from "postcss-preset-env";
import PostcssFlexBugsfixes from "postcss-flexbugs-fixes";
import friendlyFormatter from "eslint-formatter-friendly"

const postCssLoaderConfig = {
  loader: "postcss-loader",
  options: {
    // Necessary for external CSS imports to work
    // https://github.com/facebook/create-react-app/issues/2677
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
    { // To be safe, you can use enforce: "pre" section to check source files, not modified by other loaders (like babel-loader)
      enforce: "pre",
      test: /\.js$/,
      include: appPath,
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
    }, {
      test: /\.(png\jpe?g|gif)$/,
      use: [
        {
          loader: "file-loader"
        }
      ]
    }, {
      test: /\.(png|jpe?g|gif)$/,
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