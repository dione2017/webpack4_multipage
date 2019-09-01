require("@babel/register")({
  presets: ["@babel/preset-env"]
});

process.env.NODE_ENV = "development";

module.exports = require("./devServer");
