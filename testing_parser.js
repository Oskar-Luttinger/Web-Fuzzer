"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var globals_1 = require("@jest/globals");
var parsers_1 = require("./parsers");
(0, globals_1.test)("parse_args parses flags and key=value", function () {
    process.argv = ["node", "script", "--port=8080", "-v", "--debug"];
    (0, globals_1.expect)((0, parsers_1.parse_args)()).toEqual({
        port: "8080",
        v: true,
        debug: true
    });
});
