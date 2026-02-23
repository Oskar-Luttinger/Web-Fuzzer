"use strict";
// Bendy sender
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse_args = parse_args;
exports.inject = inject;
var net_1 = require("net");
var fs = require("fs");
var url_1 = require("url");
// Parse cmdline arguments
function parse_args() {
    var args = process.argv.slice(2); // Returns an array [--arg=value, --arg1=value, ...]
    var args_record = {};
    args.forEach(function (arg) {
        var _a = arg.replace('--', '').split('='), key = _a[0], value = _a[1];
        args_record[key] = value; // Inserts argument key and its value into args record
    });
    return args_record;
}
function inject(request, keyword, fuzzmarker) {
    if (!fuzzmarker) {
        fuzzmarker = 'FUZZ';
    }
    var _a = request.split(fuzzmarker), prefix = _a[0], suffix = _a[1];
    var payload = prefix + keyword + suffix;
    return payload;
}
function fuzzer(url, wordlist, request, fuzzmarker) {
    var wsocket = net_1.connect({ host: url.hostname, port: Number(url.port) }, function () { return send_next(); });
    wsocket.on('data', function (chunk) {
        console.log(chunk.toString());
    });
    function send_next() {
        if (wordlist.length === 0) {
            wsocket.end();
            return;
        }
        var currentKeyword = wordlist.shift();
        if (!currentKeyword)
            return;
        var payload = inject(request, currentKeyword, fuzzmarker);
        wsocket.write(payload);
    }
}

var result_table = [];
function main() {
    // Get file path from user
    var args = parse_args();
    var content = fs.readFileSync(args.path, 'utf-8'); // Synchronous function, rest of program will wait until finished
    var url = new url_1.URL(args.url);
    var passwords = fs.readFileSync(args.wlist, 'utf-8');
    var wlist = passwords.split("\n").map(function (p) { return p.trim(); }).filter(function (p) { return p !== ""; });
    fuzzer(url, wlist, content, 'FUZZ');
    console.log(result_table);
}
main();
