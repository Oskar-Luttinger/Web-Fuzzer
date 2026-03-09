"use strict";
exports.__esModule = true;
exports.get_url = exports.get_body = exports.change_cl = exports.parse_status = exports.parse_content = exports.parse_args = void 0;
function parse_args() {
    var args = process.argv.slice(2);
    var result = {};
    for (var _i = 0, args_1 = args; _i < args_1.length; _i++) {
        var arg = args_1[_i];
        if (!arg.includes('=')) {
            result[arg.slice(1)] = true;
        }
        else if (arg.startsWith('--')) {
            var _a = arg.slice(2).split("="), key = _a[0], value = _a[1];
            result[key] = value !== null && value !== void 0 ? value : true;
        }
        else if (arg.startsWith('-')) {
            var _b = arg.slice(1).split("="), key = _b[0], value = _b[1];
            result[key] = value !== null && value !== void 0 ? value : true;
        }
    }
    return result;
}
exports.parse_args = parse_args;
function parse_content(header) {
    var match = header.match(/content-length:\s*(\d+)/i);
    return match ? match[1] : null;
}
exports.parse_content = parse_content;
function parse_status(data) {
    var match = data.match(/HTTP\/\d\.\d\s+(\d+)/i);
    return match ? Number(match[1]) : null;
}
exports.parse_status = parse_status;
function change_cl(payload) {
    var _a = payload.split('\r\n\r\n'), payload_headers = _a[0], payload_body = _a[1];
    if (payload_body === undefined) {
        return payload_headers;
    }
    else {
        var new_cl = Buffer.byteLength(payload_body);
        return payload.replace(/content-length:\s*(\d+)/i, "Content-length: ".concat(String(new_cl)));
    }
}
exports.change_cl = change_cl;
function get_body(response) {
    var index = response.indexOf("\r\n\r\n");
    return response.slice(index + 4);
}
exports.get_body = get_body;
function get_url(html) {
    var links = [];
    var regex = /href="([^"]+)"/gi;
    var match;
    while ((match = regex.exec(html)) !== null) {
        links.push(match[1]);
    }
    return links;
}
exports.get_url = get_url;
