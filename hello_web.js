"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.send_raw = send_raw;
exports.send = send;
// hello web!
var net_1 = require("net");
var fs = require("fs");
var argparse_ts_1 = require("./argparse.ts");
var url_1 = require("url");
var args = (0, argparse_ts_1.parse_args)();
var payload = fs.readFileSync(args.path, 'utf-8');
var url = args.url;
var wordlist_unparsed = fs.readFileSync(args.list, 'utf-8');
function send_raw(payload, urlstr, wordlist) {
    var url = new url_1.URL(urlstr);
    var socket = net_1.default.createConnection({ host: url.hostname, port: Number(url.port) }, function () {
        console.log('Connected to server!');
    });
    socket.on('connect', function () {
        socket.write(payload, 'utf-8');
    });
    socket.on('data', function (data) {
        console.log(data.toString());
    });
    socket.on('error', console.error);
}
function send(socket, payload) {
    socket.write(payload, utf - 8);
}
