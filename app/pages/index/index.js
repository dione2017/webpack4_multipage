// import { cloneDeep } from "lodash";
// import $ from "jquery";
import "reset.css";
import "bootstrap/dist/css/bootstrap.css";
import "@/assets/styles/common.less";
import "./index.less";

import "./test.js";

console.log("index1111");

if (module.hot) {
  module.hot.accept("./test.js", function () {
    console.log("hot reload");
  });
}
