## 项目介绍
本项目是一个基于[webpack4](https://webpack.js.org/)基础配置，专为 `多页应用（multiple page application）` 开发而搭建的。随着web应用越来越复杂，前端工程师们如今大多时候都在开发 `单页应用（single page application）`。但是其实有时候我们还是需要开发一些多页面的web应用程序，比如说公司官网等。像官网这种如果做成spa类型，对seo不友好，当然也可以做成基于spa的服务端渲染，那又小题大做了。所以做成一个多页应用是一个不错的选择。

## 技术栈
webpack4 + es2015+ 

此项目是基础配置，更多的是注重于项目基础架子搭建，所以一些应用方面的库都没有添加，仅仅把基于webpack的多页面配置的开发环境和生产环境弄好，另外也额外添加了对less、es6+的支持。小伙伴们可以基于此基础配置，添加自己需要的一些库如axios、echart、jquery等用于实际业务。也可以在此webpack架子基础上做一些符合自己实际项目的修改，毕竟基础架子已经有了，后面的修改不会太难的。

## 项目运行
```
git clone https://github.com/dione2017/webpack4_multipage.git

cd webpack4_multipage

npm install or yarn install(推荐使用yarn)

npm start（开发环境）

npm run build（生产打包）

npm run build:analyze（生成打包并且用 webpack-bundle-analyzer 分析构建结果）
```
npm start 运行完成之后，浏览器输入 http://127.0.0.1:9001 + 自己的页面所在目录名 + .html，就可以访问了。
比如pages下面有个page1目录，page1目录下面有index.html和index.js，那么访问路径就是http://127.0.0.1:9001/page1.html
## 项目结构（重要）
- app
  - your other-assets
  - pages
    - page1
      - index.html
      - index.js
    - page2
      - index.html
      - index.html
- configs
  - env.js
  - module.js
  - optimization.js
  - webpack.config.babel.js
  - webpackDevServer.config.babel.js
- node_modules/
- dist/
- scritps
  - start.js
  - devServer.js
- other files like package.json .gitignore .babelrc and etc.

1.scripts目录为nodejs脚本，用es6 `import export`做模块管理，用[@babel/register](https://babeljs.io/docs/en/babel-register)和 [@babel/preset-env](https://babeljs.io/docs/en/babel-preset-env)做启动转换，否则会出现 import、export 未定义的错误。

2.dist为打包构建目录

3.node_modules依赖包

4.configs目录下面为webpack配置文件，统一用es6编写，文件名以 `.babel.js` 结尾，webpack会自动用[babel](https://babeljs.io/)转换，否则会出现 import、export 未定义的错误。

5.app目录下面为我们的项目开发文件，其中的pages文件目录尤其重要，webpack在启动时候，会扫描pages下面的第一层子目录下面的index.js，比如page1目录和page2目录，扫描到之后，就把目录名作为webpack入口（entry）名，而index.js的文件路径作为webpack的入口路径，此时的webpack entry配置大改为：
```
entry: {
  page1: /xxxx/webpack4_multipage/pages/page1/index.js,
  page2: /xxxx/webpack4_multipage/pages/page2/index.js,
}
```
然后查找同级目录下面的index.html，用 `html-webpack-plugin` 生成模板插件，添加到webpack中的plugins里面去。动态扫描pages生成webpack多页面应用是整个项目最核心的基础。