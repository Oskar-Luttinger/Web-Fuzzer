"use strict";
// Bendy sender
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
var net_1 = require("net");
var fs = require("fs");
var url_1 = require("url");
var parsers_1 = require("./parsers");
function inject(request, keyword, fuzzmarker) {
    if (!fuzzmarker) {
        fuzzmarker = 'FUZZ';
    }
    var _a = request.split(fuzzmarker), prefix = _a[0], suffix = _a[1];
    var payload = prefix + keyword + suffix;
    return payload;
}
function change_cl(payload) {
    var _a = payload.split('\r\n\r\n'), payload_headers = _a[0], payload_body = _a[1];
    console.log(payload_headers);
    var new_cl = Buffer.byteLength(payload_body);
    return payload.replace(/content-length:\s*(\d+)/i, "Content-length: ".concat(String(new_cl)));
}
function snr(url, payload) {
    return new Promise(function (resolve, reject) {
        try {
            var buffer_1 = '';
            var wsock_1 = net_1.connect({ host: url.hostname, port: Number(url.port) }, function () { });
            wsock_1.on('connect', function () {
                wsock_1.write(payload, 'utf-8');
            });
            wsock_1.on('data', function crec(chunk) {
                buffer_1 += chunk;
                if (Buffer.byteLength(buffer_1, 'utf-8') > Number((0, parsers_1.parse_content)(buffer_1))) {
                    wsock_1.off('data', crec);
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
function worker(content, wlist, url) {
    return __awaiter(this, void 0, void 0, function () {
        var result_table, i, current_keyword, payload, result, content_length, status_code, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    result_table = [];
                    _a.label = 1;
                case 1:
                    if (!(wlist !== undefined && wlist.length > 0)) return [3 /*break*/, 4];
                    i = 0;
                    current_keyword = wlist.shift();
                    console.log(current_keyword);
                    if (!(current_keyword !== undefined)) return [3 /*break*/, 3];
                    payload = change_cl(inject(content, current_keyword));
                    return [4 /*yield*/, snr(url, payload)];
                case 2:
                    result = _a.sent();
                    console.log(i);
                    i = i + 1;
                    content_length = Number((0, parsers_1.parse_content)(result));
                    status_code = (0, parsers_1.parse_status)(result);
                    result_table.push([current_keyword, content_length, status_code]);
                    _a.label = 3;
                case 3: return [3 /*break*/, 1];
                case 4: return [2 /*return*/, result_table];
                case 5:
                    error_1 = _a.sent();
                    console.log(error_1);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
// Get file path from user
var args = (0, parsers_1.parse_args)();
var content = fs.readFileSync(args.path, 'utf-8'); // Synchronous function, rest of program will wait until finished
var url = new url_1.URL(args.url);
var passwords = fs.readFileSync(args.wlist, 'utf-8');
var wlist = passwords.split("\n").map(function (p) { return p.trim(); }).filter(function (p) { return p !== ""; });
function print_result() {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.allSettled([worker(content, wlist, url)])];
                case 1:
                    result = _a.sent();
                    console.log(result);
                    return [2 /*return*/];
            }
        });
    });
}
print_result();
