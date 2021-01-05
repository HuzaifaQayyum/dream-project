"use strict";
exports.__esModule = true;
var libphonenumber_js_1 = require("libphonenumber-js");
var n = libphonenumber_js_1["default"]('+9230083536735');
console.log(n && n.isValid());
