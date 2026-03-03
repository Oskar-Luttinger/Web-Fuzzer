"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
//import { snr } from "./bsender.ts"
var net_1 = require("net");
var parsers_1 = require("./parsers");
var tls_1 = require("tls");
var fs = require("fs");
var path = require("path");
function snr(url, payload, use_crypt) {
    return new Promise(function (resolve, reject) {
        try {
            var buffer_1 = '';
            var wsock_1;
            var port = url.port
                ? Number(url.port)
                : (use_crypt ? 443 : 80);
            if (use_crypt === false) {
                wsock_1 = net_1.connect({ host: url.hostname, port: port });
                wsock_1.on('connect', function () {
                    wsock_1.write(payload, 'utf-8');
                });
            }
            else {
                wsock_1 = tls_1.connect({ host: url.hostname, port: port, rejectUnauthorized: false });
                wsock_1.on('secureConnect', function () {
                    wsock_1.write(payload, 'utf-8');
                });
            }
            wsock_1.on('data', function crec(chunk) {
                buffer_1 += chunk;
                if (Buffer.byteLength(buffer_1, 'utf-8') > Number((0, parsers_1.parse_content)(buffer_1))) {
                    wsock_1.off('data', crec);
                    wsock_1.end();
                    resolve(buffer_1);
                }
            });
            wsock_1.on('error', function (error) {
                wsock_1.end();
                reject(error);
            });
        }
        catch (error) {
            console.log(error);
            reject(error);
        }
    });
}
function get_body(response) {
    var index = response.indexOf("\r\n\r\n");
    return response.slice(index + 4);
}
function get_url(html) {
    var links = [];
    var regex = /href="([^"]+)"/gi;
    var match;
    while ((match = regex.exec(html)) !== null) {
        links.push(match[1]);
    }
    return links;
}
var queue = [];
var visited = new Set();
function worker(base_url) {
    return __awaiter(this, void 0, void 0, function () {
        var current, payload, response, body, links, _i, links_1, link, full_url, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!true) return [3 /*break*/, 5];
                    current = queue.shift();
                    if (!current)
                        return [3 /*break*/, 5];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    console.log("Processing:", current.href);
                    payload = "GET ".concat(current.pathname + current.search, " HTTP/1.1\r\nHost: ").concat(base_url.host, "\r\nUser-Agent: Mozilla/5.0\r\nConnection: close\r\n\r\n");
                    return [4 /*yield*/, snr(current, payload, true)];
                case 2:
                    response = _a.sent();
                    body = get_body(response);
                    save_page(current, body);
                    links = get_url(body);
                    for (_i = 0, links_1 = links; _i < links_1.length; _i++) {
                        link = links_1[_i];
                        try {
                            full_url = new URL(link, base_url);
                            if (full_url.host === base_url.host) {
                                if (!visited.has(full_url.href)) {
                                    visited.add(full_url.href);
                                    queue.push(full_url);
                                }
                            }
                        }
                        catch (_b) {
                            // Ignore invalid URLs
                        }
                    }
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    console.log("Worker error:", err_1);
                    return [3 /*break*/, 4];
                case 4: return [3 /*break*/, 0];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function save_page(url, content) {
    var filePath = url.pathname;
    if (filePath === "/") {
        filePath = "/index.html";
    }
    if (!filePath.endsWith(".html")) {
        filePath += ".html";
    }
    var fullPath = path.join("downloaded", filePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content);
}
function start() {
    return __awaiter(this, void 0, void 0, function () {
        var baseUrl, workers, workerPromises, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    baseUrl = new URL("https://en.wikipedia.org/wiki/Billel_Benaldjia");
                    visited.add(baseUrl.href);
                    queue.push(baseUrl);
                    workers = 5;
                    workerPromises = [];
                    for (i = 0; i < workers; i++) {
                        workerPromises.push(worker(baseUrl));
                    }
                    return [4 /*yield*/, Promise.all(workerPromises)];
                case 1:
                    _a.sent();
                    console.log("Crawling finished");
                    return [2 /*return*/];
            }
        });
    });
}
start();
