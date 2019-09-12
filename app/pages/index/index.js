import { cloneDeep, throttle, debounce } from "lodash-es";
import $ from "jquery";
import "reset.css";
import "@/assets/styles/common.less";
import "./index.less";

import "./test.js";

console.log(cloneDeep, throttle, debounce, $);
console.log("index1122");

if (module.hot) {
  module.hot.accept("./test.js", function () {
    console.log("hot reload");
  });
}
