"use strict";
// Baby sender
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
exports.snr = snr;
var net_1 = require("net");
var fs = require("fs");
var url_1 = require("url");
var parsers_1 = require("./parsers");
var tls_1 = require("tls");
var helpmsg = "\nIt looks like you need some help. (*) marks required arguments\n\nUsage: \n\nbsender [-u=<url> | --url=<url>]* [-m=<sniper, ram, spyder> | --mode=<sniper, ram, spyder>]* \n[-p=<path to payload> | --payload<path to payload>]* [-ul=<path to username wordlist> | --userlist=<path to username wordlist>] \n[-pl=<path to password wordlist> | --passlist<path to password wordlist>] [-wl=<path wordlist> | --wordlist=<path wordlist>]\n[-w=<number of workers> | --workers=<number of workers>]\n[-o=<path to output> | --output=<path to output>] [-d=<ms> | --delay=<ms>]\n[-h  | --help] [-s | --stealth] [-v | --verbose]\n[-vv | --very_verbose] [-j | --jitter]\n\nDescription of arguments and values:\n\n--url = url AND port to send payload to. Ex: http://test.com:80\n\n--userlist = APPLIES TO RAM MODE: path to list of usernames to use in the attack. Ex: C:\\Users\\Attacker\\user-list.txt. \n\n--passlist = APPLIES TO RAM MODE | SNIPER MODE: path to list of passwords to use in the attack\n\n--wordlist = APPLIES TO SNIPER MODE: path to list of words to inject into the payload\n\n--workers = number of concurrent workers to run. Recommended: 20\n\n--output = path to write the output csv file to.\n\n--delay = sets a delay between each request in every worker. Note: All workers will still send their request at \n          the same time so it is not stealthy to have a long sleep but a high amount of workers.\n\n--mode = sets attack mode:\n            <sniper> = Fuzzes one parameter\n            <ram> = fuzzes two parameters. For every word in the userlist it will try every word in the pass list \n            <spyder> = crawl the target domain recursively\n\n            <help> = displays this message\n\n--stealth = sets the fuzzer to send only one request / second to reduce noise.\n\n--jitter = REQUIRES THE SLEEP ARGUMENT: adds random intervals between sleep and sleep * 4 for each request to disrupt patterns. \n\n--verbose | --very_verbose = increases the verbosity of the program i.e how much info it prints.\n";
function inject(request, keyword, fuzzmarker) {
    if (!fuzzmarker) {
        fuzzmarker = 'FUZZ';
    }
    var _a = request.split(fuzzmarker), prefix = _a[0], suffix = _a[1];
    var payload = prefix + keyword + suffix;
    return payload;
}
function tls_snr(url, payload) {
    return new Promise(function (resolve, reject) {
        try {
            var buffer_1 = '';
            var wsock_1 = tls_1.default.connect({ host: url.hostname, port: Number(url.port), rejectUnauthorized: false }, function () { });
            wsock_1.on('secureConnect', function () {
                wsock_1.write(payload, 'utf-8');
            });
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
function snr(url, payload, use_crypt) {
    return new Promise(function (resolve, reject) {
        try {
            var buffer_2 = '';
            var wsock_2;
            if (use_crypt === false) {
                wsock_2 = net_1.default.connect({ host: url.hostname, port: Number(url.port) });
                wsock_2.on('connect', function () {
                    wsock_2.write(payload, 'utf-8');
                });
            }
            else {
                wsock_2 = tls_1.default.connect({ host: url.hostname, port: Number(url.port), rejectUnauthorized: false });
                wsock_2.on('secureConnect', function () {
                    wsock_2.write(payload, 'utf-8');
                });
            }
            wsock_2.on('data', function crec(chunk) {
                buffer_2 += chunk;
                if (Buffer.byteLength(buffer_2, 'utf-8') > Number((0, parsers_1.parse_content)(buffer_2))) {
                    wsock_2.off('data', crec);
                    wsock_2.end();
                    resolve(buffer_2);
                }
            });
            wsock_2.on('error', function (error) {
                wsock_2.end();
                reject(error);
            });
        }
        catch (error) {
            console.log(error);
            reject(error);
        }
    });
}
function pass_chunk(chunk, num_workers) {
    var password_chunks = [];
    var len = chunk.length / num_workers;
    for (var i = 0; num_workers > i; i = i + 1) {
        password_chunks.push(chunk.splice(0, len));
    }
    return password_chunks;
}
function sniper_worker(content, wlist, url, use_crypt) {
    return __awaiter(this, void 0, void 0, function () {
        var result_table, current_keyword, payload, result_1, content_length, status_code, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    result_table = [];
                    _a.label = 1;
                case 1:
                    if (!(wlist !== undefined && wlist.length > 0)) return [3 /*break*/, 3];
                    current_keyword = wlist.shift();
                    payload = (0, parsers_1.change_cl)(inject(content, current_keyword));
                    return [4 /*yield*/, snr(url, payload, use_crypt)];
                case 2:
                    result_1 = _a.sent();
                    content_length = Number((0, parsers_1.parse_content)(result_1));
                    status_code = (0, parsers_1.parse_status)(result_1);
                    result_table.push([current_keyword, content_length, status_code]);
                    return [3 /*break*/, 1];
                case 3: return [2 /*return*/, result_table];
                case 4:
                    error_1 = _a.sent();
                    console.log(error_1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function ram_worker(content, userlist, passlist, url, use_crypt) {
    return __awaiter(this, void 0, void 0, function () {
        var result_table, current_username, payload, current_password, result_2, content_length, status_code, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    result_table = [];
                    _a.label = 1;
                case 1:
                    if (!(userlist !== undefined && userlist.length > 0)) return [3 /*break*/, 5];
                    current_username = userlist.shift();
                    payload = inject(content, current_username, 'USER');
                    _a.label = 2;
                case 2:
                    if (!(passlist !== undefined && passlist.length > 0)) return [3 /*break*/, 4];
                    current_password = passlist.shift();
                    payload = (0, parsers_1.change_cl)(inject(content, current_password, 'PASS'));
                    return [4 /*yield*/, snr(url, payload, use_crypt)];
                case 3:
                    result_2 = _a.sent();
                    content_length = Number((0, parsers_1.parse_content)(result_2));
                    status_code = (0, parsers_1.parse_status)(result_2);
                    result_table.push([current_username, current_password, content_length, status_code]);
                    return [3 /*break*/, 2];
                case 4: return [3 /*break*/, 1];
                case 5: return [2 /*return*/, result_table];
                case 6:
                    error_2 = _a.sent();
                    console.log(error_2);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
function sniper() {
    return __awaiter(this, void 0, void 0, function () {
        var worker_promises, passwords, wlist, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    passwords = fs.readFileSync(String(args.wlist ? args.wlist : args.w), 'utf-8');
                    wlist = passwords.split("\n").map(function (p) { return p.trim(); }).filter(function (p) { return p !== ""; });
                    if (url.protocol === 'https:') {
                        worker_promises = pass_chunk(wlist, number_of_workers).map(function (chunk) { return sniper_worker(content, chunk, url, true); });
                    }
                    else {
                        worker_promises = pass_chunk(wlist, number_of_workers).map(function (chunk) { return sniper_worker(content, chunk, url, false); });
                    }
                    return [4 /*yield*/, Promise.allSettled(worker_promises)];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, result];
            }
        });
    });
}
function ram() {
    return __awaiter(this, void 0, void 0, function () {
        var worker_promises, passlist, passwords, userlist, usernames;
        return __generator(this, function (_a) {
            passlist = fs.readFileSync(String(args.p ? args.p : args.pass), 'utf-8');
            passwords = passlist.split("\n").map(function (p) { return p.trim(); }).filter(function (p) { return p !== ""; });
            userlist = fs.readFileSync(String(args.p ? args.p : args.pass), 'utf-8');
            usernames = userlist.split("\n").map(function (p) { return p.trim(); }).filter(function (p) { return p !== ""; });
            if (url.protocol === 'https:') {
                worker_promises = pass_chunk(wlist, number_of_workers).map(function (chunk) { return ram_worker(content, chunk, url, true); });
            }
            else {
                worker_promises = pass_chunk(wlist, number_of_workers).map(function (chunk) { return ram_worker(content, chunk, url, false); });
            }
            return [2 /*return*/];
        });
    });
}
// Save to csv
function save_to_csv(result) {
    var file_path;
    if (args.o || args.output) {
        file_path = args.o ? args.o : args.output;
    }
    else {
        file_path = 'output.csv';
    }
    var csvhead = 'KEYWORD, RESPONSE LENGTH, RESPONSE CODE';
    fs.writeFile(file_path, csvhead, 'utf8', function (err) {
        if (err) {
            console.error('Error writing to CSV file', err);
        }
        else {
            console.log("Headers saved!");
        }
    });
    for (var _i = 0, result_3 = result; _i < result_3.length; _i++) {
        var r = result_3[_i];
        if (r.status === 'fulfilled') {
            var worker_data = r.value.map(function (row) { return row.join(','); }).join('\n');
            fs.appendFile(file_path, '\n' + worker_data, 'utf8', function (err) {
                if (err) {
                    console.error('Error appending to CSV file', err);
                }
                else {
                    console.log("Data appended.");
                }
            });
        }
        else {
            console.log('Worker failed');
        }
    }
}
// return selected function
function mode_select(mode) {
    return mode === 'sniper'
        ? sniper
        : mode === 'ram'
            ? ram
            : spyder;
}
// Parse args and assign options to constants / variables
var args = (0, parsers_1.parse_args)();
if (args.help || args.h) {
    console.log(helpmsg);
    process.exit(0);
}
var content = fs.readFileSync(String(args.path), 'utf-8'); // Synchronous function, rest of program will wait until finished
var url = new url_1.URL(String(args.url));
var number_of_workers = args.workers || args.w ? Number(args.workers) : 10;
// Set attack mode and run attack
var attack = mode_select(args.m ? args.m : args.mode);
var result = await attack();
save_to_csv(result);
