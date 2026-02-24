"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse_args = parse_args;
exports.parse_content = parse_content;
function parse_args() {
    var args = process.argv.slice(2);
    var args_record = {};
    args.forEach(function (arg) {
        var _a = arg.replace('--', '').split('='), key = _a[0], value = _a[1];
        args_record[key] = value;
    });
    return args_record;
}
function parse_content(header) {
    var match = header.match(/content-length:\s*(\d+)/i);
    return match ? match[1] : null;
}
