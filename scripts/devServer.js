import webpack from "webpack";
import WebpackDevServer from "webpack-dev-server";
import webpackConfig from "../configs/webpack.config.babel";
import webpackDevServerConfig from "../configs/webpackDevServer.config.babel";
import { PORT } from "../configs/env";

const compiler = webpack(webpackConfig);
const server = new WebpackDevServer(compiler, webpackDevServerConfig);

server.listen(PORT, function () {
  console.log("Example app listening on port 9001!\n");
});

["SIGINT", "SIGTERM"].forEach(function (sig) {
  process.on(sig, function () {
    server.close();
    process.exit();
  });
});
