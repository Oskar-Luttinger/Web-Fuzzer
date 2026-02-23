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
function worker(url, wordlist, request, fuzzmarker) {
    console.log(url.hostname, Number(url.port));
    var wsocket = net_1.connect({ host: url.hostname, port: Number(url.port) }, function () {
        wsocket.on('connect', function () {
            console.log('connected to server!');
            var _loop_1 = function () {
                var keyword = wordlist.shift();
                if (keyword !== undefined) {
                    var payload = inject(request, keyword, fuzzmarker);
                    wsocket.write(payload, 'utf-8');
                    wsocket.on('data', function (data) {
                        var data_len = data.length;
                        var resp_code = Number(data.slice(8, 12));
                        var entry = [keyword, data_len, resp_code];
                        result_table.push(entry);
                    });
                    wsocket.on('error', console.error);
                }
            };
            while (wordlist.length !== 1 || wordlist === undefined) {
                _loop_1();
            }
        });
    });
}
var result_table = [];
function main() {
    // Get file path from user
    var args = parse_args();
    var content = fs.readFileSync(args.path, 'utf-8'); // Synchronous function, rest of program will wait until finished
    var url = new url_1.URL(args.url);
    var passwords = fs.readFileSync(args.wlist, 'utf-8');
    var wlist = passwords.split("\n").map(function (p) { return p.trim(); }).filter(function (p) { return p !== ""; });
    worker(url, wlist, content, 'FUZZ');
    console.log(result_table);
}
main();
