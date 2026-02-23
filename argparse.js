"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse_args = parse_args;
function parse_args() {
    var args = process.argv.slice(2);
    var args_record = {};
    args.forEach(function (arg) {
        var _a = arg.replace('--', '').split('='), key = _a[0], value = _a[1];
        args_record[key] = value;
    });
    return args_record;
}
