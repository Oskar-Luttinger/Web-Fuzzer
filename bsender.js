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
var net = require("net");
var fs = require("fs");
var url_1 = require("url");
var parsers_1 = require("./parsers");
var tls = require("tls");
var path = require("path");
var banner = "\n\n\u2591\u2592\u2593\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2593\u2592\u2591       \u2591\u2592\u2593\u2588\u2593\u2592\u2591\u2591\u2592\u2593\u2588\u2593\u2592\u2591      \u2591\u2592\u2593\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2593\u2592\u2591    \u2591\u2592\u2593\u2588\u2593\u2592\u2591\u2591\u2592\u2593\u2588\u2593\u2592\u2591 \n\u2591\u2592\u2593\u2588\u2593\u2592\u2591\u2591\u2592\u2593\u2588\u2593\u2592\u2591      \u2591\u2592\u2593\u2588\u2593\u2592\u2591\u2591\u2592\u2593\u2588\u2593\u2592\u2591      \u2591\u2592\u2593\u2588\u2593\u2592\u2591\u2591\u2592\u2593\u2588\u2593\u2592\u2591   \u2591\u2592\u2593\u2588\u2593\u2592\u2591\u2591\u2592\u2593\u2588\u2593\u2592\u2591 \n\u2591\u2592\u2593\u2588\u2593\u2592\u2591\u2591\u2592\u2593\u2588\u2593\u2592\u2591      \u2591\u2592\u2593\u2588\u2593\u2592\u2591\u2591\u2592\u2593\u2588\u2593\u2592\u2591      \u2591\u2592\u2593\u2588\u2593\u2592\u2591\u2591\u2592\u2593\u2588\u2593\u2592\u2591   \u2591\u2592\u2593\u2588\u2593\u2592\u2591\u2591\u2592\u2593\u2588\u2593\u2592\u2591 \n\u2591\u2592\u2593\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2593\u2592\u2591       \u2591\u2592\u2593\u2588\u2593\u2592\u2591\u2591\u2592\u2593\u2588\u2593\u2592\u2591      \u2591\u2592\u2593\u2588\u2593\u2592\u2591\u2591\u2592\u2593\u2588\u2593\u2592\u2591    \u2591\u2592\u2593\u2588\u2588\u2588\u2588\u2588\u2588\u2593\u2592\u2591  \n\u2591\u2592\u2593\u2588\u2593\u2592\u2591\u2591\u2592\u2593\u2588\u2593\u2592\u2591      \u2591\u2592\u2593\u2588\u2593\u2592\u2591\u2591\u2592\u2593\u2588\u2593\u2592\u2591      \u2591\u2592\u2593\u2588\u2593\u2592\u2591\u2591\u2592\u2593\u2588\u2593\u2592\u2591      \u2591\u2592\u2593\u2588\u2593\u2592\u2591     \n\u2591\u2592\u2593\u2588\u2593\u2592\u2591\u2591\u2592\u2593\u2588\u2593\u2592\u2591\u2592\u2593\u2588\u2588\u2593\u2592\u2591\u2592\u2593\u2588\u2593\u2592\u2591\u2591\u2592\u2593\u2588\u2593\u2592\u2591\u2592\u2593\u2588\u2588\u2593\u2592\u2591\u2592\u2593\u2588\u2593\u2592\u2591\u2591\u2592\u2593\u2588\u2593\u2592\u2591\u2592\u2593\u2588\u2588\u2593\u2592\u2591\u2592\u2593\u2588\u2593\u2592\u2591     \n\u2591\u2592\u2593\u2588\u2593\u2592\u2591\u2591\u2592\u2593\u2588\u2593\u2592\u2591\u2592\u2593\u2588\u2588\u2593\u2592\u2591\u2591\u2592\u2593\u2588\u2588\u2588\u2588\u2588\u2588\u2593\u2592\u2591\u2591\u2592\u2593\u2588\u2588\u2593\u2592\u2591\u2592\u2593\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2593\u2592\u2591\u2591\u2592\u2593\u2588\u2588\u2593\u2592\u2591\u2592\u2593\u2588\u2593\u2592\u2591     \n                                                                   \n";
var sub_banner = "\n\n\u2591\u2588\u2580\u2588\u2591\u2588\u2580\u2584\u2591\u2588\u2580\u2580\u2591\u2591\u2591\u2588\u2591\u2588\u2591\u2588\u2580\u2588\u2591\u2588\u2591\u2588\u2591\u2591\u2591\u2588\u2580\u2584\u2591\u2588\u2580\u2580\u2591\u2588\u2580\u2588\u2591\u2588\u2580\u2584\u2591\u2591\u2591\u2588\u2591\u2588\u2591\u2588\u2580\u2580\u2591\u2580\u2588\u2580\u2591\u2580\u2580\u2588\n\u2591\u2588\u2580\u2588\u2591\u2588\u2580\u2584\u2591\u2588\u2580\u2580\u2591\u2591\u2591\u2591\u2588\u2591\u2591\u2588\u2591\u2588\u2591\u2588\u2591\u2588\u2591\u2591\u2591\u2588\u2591\u2588\u2591\u2588\u2580\u2580\u2591\u2588\u2580\u2588\u2591\u2588\u2591\u2588\u2591\u2591\u2591\u2591\u2588\u2591\u2591\u2588\u2580\u2580\u2591\u2591\u2588\u2591\u2591\u2591\u2580\u2591\n\u2591\u2580\u2591\u2580\u2591\u2580\u2591\u2580\u2591\u2580\u2580\u2580\u2591\u2591\u2591\u2591\u2580\u2591\u2591\u2580\u2580\u2580\u2591\u2580\u2580\u2580\u2591\u2591\u2591\u2580\u2580\u2591\u2591\u2580\u2580\u2580\u2591\u2580\u2591\u2580\u2591\u2580\u2580\u2591\u2591\u2591\u2591\u2591\u2580\u2591\u2591\u2580\u2580\u2580\u2591\u2591\u2580\u2591\u2591\u2591\u2580\u2591\n\n";
var helpmsg = "\n\n    /\u203E\u203E    \n    |  |    \n    @  @    \n    || |/   \n    || ||   \n    |\\_/|   \n    \\___/   \n      /\\    \n    /\u203E  \u203E\u203E\u203E\u203E\u203E\u203E\u203E\u203E\u203E\u203E\u203E\u203E\u203E\u203E\u203E\u203E\u203E\u203E\u203E\u203E\u203E\u203E\u203E\u203E\u203E\u203E\u203E\u203E\u203E\u203E\u203E\u203E\u203E\u203E\u203E\u203E\u203E\u203E\u203E\u203E\u203E\u203E\u203E\u203E\u203E\\  \n    | It looks like you are trying to fuzz something |  \n    | Would you like some help with that?            |  \n    \\________________________________________________/  \n\nUsage: \n\nbsender [-u=<url> | --url=<url>]* [-m=<sniper, ram, spyder> | --mode=<sniper, ram, spyder>]* \n[-p=<path to payload> | --payload<path to payload>]* [-ul=<path to username wordlist> | --userlist=<path to username wordlist>] \n[-pl=<path to password wordlist> | --passlist<path to password wordlist>] [-wl=<path wordlist> | --wordlist=<path wordlist>]\n[-w=<number of workers> | --workers=<number of workers>]\n[-o=<path to output> | --output=<path to output>] [-d=<ms> | --delay=<ms>]\n[-h  | --help] [-s | --stealth] [-v | --verbose]\n[-j | --jitter]\n\nDescription of arguments and values:\n\n--url (*) = url AND port to send payload to. Ex: http://test.com:80\n\n--payload (*) = path to raw http payload to inject into \n\n--userlist = APPLIES TO RAM MODE: path to list of usernames to use in the attack. Ex: C:\\Users\\Attacker\\user-list.txt. \n\n--passlist = APPLIES TO RAM MODE | SNIPER MODE: path to list of passwords to use in the attack\n\n--wordlist = APPLIES TO SNIPER MODE: path to list of words to inject into the payload\n\n--workers = number of concurrent workers to run. Recommended: 20\n\n--output = path to write the output csv file to.\n\n--delay = sets a delay between each request in every worker. Note: All workers will still send their request at \n          the same time so it is not stealthy to have a long sleep but a high amount of workers.\n\n--mode (*) = sets attack mode:\n            <sniper> = Fuzzes one parameter\n            <ram> = fuzzes two parameters. For every word in the userlist it will try every word in the pass list \n            <spyder> = crawl the target domain recursively\n\n            <help> = displays this message\n\n--stealth = sets the fuzzer to send only one request / second to reduce noise.\n\n--jitter = REQUIRES THE SLEEP ARGUMENT: adds random intervals between sleep and sleep * 8 for each request to disrupt patterns. \n\n--verbose = increases the verbosity of the program i.e how much info it prints.\n";
function inject(request, keyword, fuzzmarker) {
    if (!fuzzmarker) {
        fuzzmarker = 'FUZZ';
    }
    var _a = request.split(fuzzmarker), prefix = _a[0], suffix = _a[1];
    var payload = prefix + keyword + suffix;
    return payload;
}
function sleep(ms) {
    return new Promise(function (resolve) { return setTimeout(resolve, ms); });
}
function get_jitter(baseSleep) {
    // Generate a random number between delay and delay * 8
    var min = baseSleep;
    var max = baseSleep * 8;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function print_error(error) {
    console.log(error);
    process.exit(1);
}
function snr(url, payload, use_crypt) {
    return new Promise(function (resolve, reject) {
        try {
            var buffer_1 = '';
            var wsock_1;
            // 1. Hantera porten ordentligt (url.port är ofta tom sträng)
            var port = url.port ? Number(url.port) : (use_crypt ? 443 : 80);
            var host = url.hostname;
            // 2. Skapa anslutningen
            if (use_crypt === false) {
                wsock_1 = net.connect({ host: host, port: port });
                wsock_1.on('connect', function () {
                    // Se till att payload har HTTP-avslutning (\r\n\r\n)
                    wsock_1.write(payload, 'utf-8');
                });
            }
            else {
                wsock_1 = tls.connect({ host: host, port: port, rejectUnauthorized: false });
                wsock_1.on('secureConnect', function () {
                    wsock_1.write(payload, 'utf-8');
                });
            }
            // 3. Gemensamma händelselyssnare
            wsock_1.on('data', function crec(chunk) {
                buffer_1 += chunk.toString('utf-8');
                // Check that we have recieved *enough* data
                try {
                    var contentLength = Number((0, parsers_1.parse_content)(buffer_1));
                    if (!isNaN(contentLength) && Buffer.byteLength(buffer_1, 'utf-8') >= contentLength) {
                        wsock_1.off('data', crec);
                        wsock_1.end();
                        resolve(buffer_1);
                    }
                }
                catch (e) {
                }
            });
            wsock_1.on('end', function () {
                resolve(buffer_1);
            });
            wsock_1.on('error', function (error) {
                console.error('Socket error:', error);
                wsock_1.destroy();
                reject(error);
            });
            // Prevent dead-hangs
            wsock_1.setTimeout(10000, function () {
                wsock_1.destroy();
                reject(new Error('Timeout after 10s'));
            });
        }
        catch (error) {
            console.log('Catch error:', error);
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
                    _a.trys.push([0, 5, , 6]);
                    result_table = [];
                    _a.label = 1;
                case 1:
                    if (!(wlist !== undefined && wlist.length > 0)) return [3 /*break*/, 4];
                    current_keyword = wlist.shift();
                    payload = (0, parsers_1.change_cl)(inject(content, current_keyword));
                    return [4 /*yield*/, snr(url, payload, use_crypt)];
                case 2:
                    result_1 = _a.sent();
                    content_length = Number((0, parsers_1.parse_content)(result_1));
                    status_code = (0, parsers_1.parse_status)(result_1);
                    result_table.push([current_keyword, content_length, status_code]);
                    return [4 /*yield*/, sleep(jitter ? get_jitter(delay) : delay)];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, result_table];
                case 5:
                    error_1 = _a.sent();
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function ram_worker(content, userlist, passlist, url, use_crypt) {
    return __awaiter(this, void 0, void 0, function () {
        var result_table, current_username, payload, i, current_password, payload_acc, result_2, content_length, status_code, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 8, , 9]);
                    result_table = [];
                    _a.label = 1;
                case 1:
                    if (!(userlist !== undefined && userlist.length > 0)) return [3 /*break*/, 7];
                    current_username = userlist.shift();
                    payload = inject(content, current_username, 'USERFUZZ');
                    i = 0;
                    _a.label = 2;
                case 2:
                    if (!(i < passlist.length)) return [3 /*break*/, 6];
                    current_password = passlist[i];
                    console.log(current_password);
                    payload_acc = (0, parsers_1.change_cl)(inject(payload, current_password, 'PASSFUZZ'));
                    console.log(payload_acc);
                    return [4 /*yield*/, snr(url, payload_acc, use_crypt)];
                case 3:
                    result_2 = _a.sent();
                    console.log(result_2);
                    content_length = Number((0, parsers_1.parse_content)(result_2));
                    status_code = (0, parsers_1.parse_status)(result_2);
                    result_table.push([current_username, current_password, content_length, status_code]);
                    return [4 /*yield*/, sleep(jitter ? get_jitter(delay) : delay)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    i += 1;
                    return [3 /*break*/, 2];
                case 6: return [3 /*break*/, 1];
                case 7: return [2 /*return*/, result_table];
                case 8:
                    error_2 = _a.sent();
                    console.log(error_2);
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/];
            }
        });
    });
}
function sniper() {
    return __awaiter(this, void 0, void 0, function () {
        var passwords, wlist, worker_promises, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    passwords = fs.readFileSync(String(args.wlist ? args.wlist : args.wl), 'utf-8');
                    wlist = passwords.split("\n").map(function (p) { return p.trim(); }).filter(function (p) { return p !== ""; });
                    worker_promises = pass_chunk(wlist, number_of_workers).map(function (chunk) { return sniper_worker(content, chunk, url, url.protocol === 'https:' ? true : false); });
                    return [4 /*yield*/, Promise.allSettled(worker_promises)];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, result];
            }
        });
    });
}
function spyder_worker(base_url, visited, queue) {
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
                    payload = "GET ".concat(current.pathname + current.search, " HTTP/1.1\r\n                            Host: ").concat(base_url.host, "\r\n                            User-Agent: Mozilla/5.0\r\n                            Connection: close\r\n                            \r\n                            ");
                    return [4 /*yield*/, snr(current, payload, true)];
                case 2:
                    response = _a.sent();
                    body = (0, parsers_1.get_body)(response);
                    save_page(current, body);
                    links = (0, parsers_1.get_url)(body);
                    for (_i = 0, links_1 = links; _i < links_1.length; _i++) {
                        link = links_1[_i];
                        try {
                            full_url = new url_1.URL(link, base_url);
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
function ram() {
    return __awaiter(this, void 0, void 0, function () {
        var passlist, passwords, userlist, usernames, username_chunks, worker_promises, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    passlist = fs.readFileSync(String(args.pl ? args.pl : args.passlist), 'utf-8');
                    passwords = passlist.split("\n").map(function (p) { return p.trim(); }).filter(function (p) { return p !== ""; });
                    userlist = fs.readFileSync(String(args.ul ? args.ul : args.userlist), 'utf-8');
                    usernames = userlist.split("\n").map(function (p) { return p.trim(); }).filter(function (p) { return p !== ""; });
                    username_chunks = pass_chunk(usernames, number_of_workers);
                    worker_promises = username_chunks.map(function (user_chunk, index) {
                        return ram_worker(content, user_chunk, passwords, url, url.protocol === 'https:' ? true : false);
                    });
                    console.log(worker_promises);
                    return [4 /*yield*/, Promise.allSettled(worker_promises)];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, result];
            }
        });
    });
}
1;
// Save to csv
function save_to_csv(result) {
    var file_path;
    var output = args.o ? args.o : args.output;
    if (typeof output === 'string') {
        file_path = args.o ? String(args.o) : String(args.output);
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
function spyder() {
    return __awaiter(this, void 0, void 0, function () {
        var queue, visited, workers, workerPromises, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    queue = [];
                    visited = new Set();
                    visited.add(url.href);
                    queue.push(url);
                    workers = 5;
                    workerPromises = [];
                    for (i = 0; i < workers; i++) {
                        workerPromises.push(spyder_worker(url, visited, queue));
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
console.log(banner);
// Parse args and assign options to constants / variables
var args = (0, parsers_1.parse_args)();
var verbose = false;
if (args.help || args.h) {
    console.log(sub_banner);
    console.log(helpmsg);
    process.exit(0);
}
if (args.v || args.verbose) {
    verbose = true;
}
console.log(args);
var content = fs.readFileSync(String(args.p ? args.p : args.payload), 'utf-8');
var url = new url_1.URL(String(args.url ? args.url : args.u));
var number_of_workers = args.w ? Number(args.w) : args.workers ? Number(args.workers) : 10;
var delay = args.d ? Number(args.d) : args.delay ? Number(args.delay) : 0;
var jitter = false;
if (args.s || args.stealth) {
    delay = 1000;
    number_of_workers = 1;
}
if (args.j || args.jitter) {
    jitter = true;
}
// Set attack mode and run attack
var result;
var mode = args.m ? args.m : args.mode;
function main() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(mode === 'sniper')) return [3 /*break*/, 2];
                    return [4 /*yield*/, sniper()];
                case 1:
                    result = _a.sent();
                    save_to_csv(result);
                    return [3 /*break*/, 5];
                case 2:
                    if (!(mode === 'ram')) return [3 /*break*/, 4];
                    return [4 /*yield*/, ram()];
                case 3:
                    result = _a.sent();
                    save_to_csv(result);
                    return [3 /*break*/, 5];
                case 4:
                    if (mode === 'spyder') {
                        spyder();
                    }
                    _a.label = 5;
                case 5: return [2 /*return*/];
            }
        });
    });
}
main();
