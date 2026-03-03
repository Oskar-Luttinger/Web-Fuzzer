"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse_args = parse_args;
exports.parse_content = parse_content;
exports.parse_status = parse_status;
exports.change_cl = change_cl;
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
function parse_status(data) {
    var match = data.match(/HTTP\/\d\.\d\s+(\d+)/i);
    return match ? Number(match[1]) : null;
}
function change_cl(payload) {
    var _a = payload.split('\r\n\r\n'), payload_headers = _a[0], payload_body = _a[1];
    var new_cl = Buffer.byteLength(payload_body);
    return payload.replace(/content-length:\s*(\d+)/i, "Content-length: ".concat(String(new_cl)));
}
