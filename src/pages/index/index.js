import "babel-polyfill";
import $ from "jquery";

import "./index.scss";
import "bootstrap/dist/css/bootstrap.min.css";

import * as _ from "lodash";

console.log(_);
console.log($);

function test () {
  console.log("async4");
}

test();

console.log(2, 3, 1212);

var a = {
  t: 1,
  b: 2
};

console.log(a);
