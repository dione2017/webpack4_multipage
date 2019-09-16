import webpack from "webpack";
import webpackConfig from "../configs/webpack.config.babel";
import formatMessages from "webpack-format-messages";
import chalk from "chalk";
import { isBundleAnalyze } from "../configs/env";

process.on("unhandledRejection", err => {
  throw err;
});

function build () {
  console.log(chalk.yellow("Creating an optimized production build...\n"));
  const complier = webpack(webpackConfig);
  complier.run((err, stats) => {
    let messages;
    if (err) {
      messages = formatMessages({
        errors: [err.message],
        warnings: []
      });
    } else {
      messages = formatMessages(stats);
    }
    if (stats.hasErrors()) {
      if (messages.errors.length) {
        console.log(chalk.red("Failed to compile.\n"));
        messages.errors.forEach(e => console.log(e));
        return;
      }
      process.exit(1);
    }

    if (stats.hasWarnings()) {
      if (messages.warnings.length) {
        console.log(chalk.yellow("Compiled with warnings.\n"));
        messages.warnings.forEach(w => console.log(w));
      }
    }
    let buildCoastTime = (stats.endTime - stats.startTime) / 1000;
    buildCoastTime = buildCoastTime.toFixed(2);

    console.log(chalk.blue(
      `build completed in ${buildCoastTime}s\n`
    ));
    !isBundleAnalyze && console.log(
      "if you want to get the detail info of bundle result, please do like this:\n\n",
      chalk.yellow(
        "npm run build:analyze\n"
      ));
  });
}

build();
