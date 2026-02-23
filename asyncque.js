"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var argparse_1 = require("./argparse");
var args = (0, argparse_1.parse_args)();
var passwords = fs.readFileSync(args.worst_password, 'utf-8');
var queue = passwords.split("\n").map(function (p) { return p.trim(); }).filter(function (p) { return p !== ""; });
console.log(queue);
