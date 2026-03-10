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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
var net = require("net");
var fs = require("fs");
var url_1 = require("url");
var parsers_1 = require("./parsers");
var tls = require("tls");
var path = require("path");
var banners_1 = require("./banners");
////////////////////
// HELPER FUNCTIONS
////////////////////
/**
 * Inject - Replaces a fuzzmarker in a string with a keyword
 * @example inject('this is a FUZZ text', short, FUZZ) will return
 *          'this is a short text'
 * @param {string} request the request to inject the keyword into
 * @param {string} keyword the keyword to inject
 * @param {string} fuzzmarker a string inside the request to replace with the keyword
 * @returns string where fuzzmarker is replaced by a keyword
 */
function inject(request, keyword, fuzzmarker) {
    if (!fuzzmarker) {
        fuzzmarker = 'FUZZ';
    }
    else { }
    var _a = request.split(fuzzmarker), prefix = _a[0], suffix = _a[1];
    var payload = prefix + keyword + suffix;
    return payload;
}
/**
 * Sleep - pauses program execution for given amount of miliseconds by only
 * resolving the promise after given time has passed
 * @param {number} ms amount of milliseconds to wait for
 * @returns Promise
 */
function sleep(ms) {
    return new Promise(function (resolve) { return setTimeout(resolve, ms); });
}
/**
 * get_jitter - returns a random number between base sleep ( delay global var)
 * and base sleep * 8
 * @param base_sleep
 * @returns number between base sleep and base sleep * 8
 */
function get_jitter(base_sleep) {
    var min = base_sleep;
    var max = base_sleep * 8;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
/**
 * print_error - Prints out an error message and exits the program
 * @param error error string to print
 */
function print_error(error) {
    console.log("ERROR: ".concat(error, "\n"));
    process.exit(1);
}
/**
 * pass_chunk splits an array into a table where each row is a section
 * of the original array
 * @example pass_chunk([1, 2, 3, 4, 5, 6, 7, 8, 9], 3)
 *          results in [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
 * @param arr array to split
 * @param workers number of chunks / rows to split original array into
 * @returns A table where each row is a section of arr
 */
function pass_chunk(arr, workers) {
    var n = arr.length;
    var base_size = Math.floor(n / workers);
    var remainder = n % workers;
    var result = [];
    var start = 0;
    for (var i = 0; i < workers; i++) {
        var size = base_size + (i < remainder ? 1 : 0);
        var chunk = arr.slice(start, start + size);
        if (chunk.length > 0) {
            result.push(chunk);
            start += size;
        }
        else { }
    }
    return result;
}
/**
 * save_to_csv saves result from a Promise.Allsettled call table to a csv file,
 * @param {PromiseSettledResult} result A PromiseSettledResult eg. an array of records.
 * @returns void - But it saves result to a new csv file 'output.csv unless args.output is defined.
 */
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
        else { }
    });
    for (var _i = 0, result_1 = result; _i < result_1.length; _i++) {
        var r = result_1[_i];
        if (r.status === 'fulfilled') {
            var worker_data = r.value.map(function (row) { return row.join(','); }).join('\n');
            fs.appendFile(file_path, '\n' + worker_data, 'utf8', function (err) {
                if (err) {
                    console.error('Error appending to CSV file', err);
                }
                else { }
            });
        }
        else {
            console.log('Worker failed');
        }
    }
    console.log("Data saved!");
}
////////////////////////
// NETWORK FUNCTION
////////////////////////
/**
 * Snr - (send and recieve) sends a payload to the given url and resloves with the response or error
 * @param {URL} url url to target
 * @param {string} payload http payload to send
 * @param {boolean} use_crypt tls option false for no tls true for tls
 * @returns raw response http OR error message
 */
function snr(url, payload, use_crypt) {
    return new Promise(function (resolve, reject) {
        try {
            var buffer_1 = '';
            var wsock_1;
            var port = url.port ? Number(url.port) : (use_crypt ? 443 : 80);
            var host = url.hostname;
            if (use_crypt === false) {
                wsock_1 = net.connect({ host: host, port: port });
                wsock_1.on('connect', function () {
                    wsock_1.write(payload, 'utf-8');
                });
            }
            else {
                wsock_1 = tls.connect({ host: host, port: port, rejectUnauthorized: false });
                wsock_1.on('secureConnect', function () {
                    wsock_1.write(payload, 'utf-8');
                });
            }
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
                    else { }
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
//////////////////////
// SNIPER FUNCTIONS
//////////////////////
/**
 * sniper - sniper attack mode main funciton, used to create workers and run them.
 * @returns Result from running the worker functions in parallel
 */
function sniper() {
    return __awaiter(this, void 0, void 0, function () {
        var passwords, wlist, worker_promises, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Create worker array
                    if (!(args.w || args.wlist)) {
                        print_error('Missing required argument --wlist=');
                    }
                    else { }
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
/**
 * sniper_worker - worker function for sniper attack mode,
 * for every word in the wordlist it injects it into the payload, sends the payload, returns a table where each row contains
 * [keyword, content lenght, status code] for each request sent.
 * @param {string} content the original captured payload
 * @param {Array} wlist the wordlist to inject from
 * @param {URL} url the url to the target site
 * @param {boolean} use_crypt tls options, true for use tls else false.
 * @returns a table of results from each sent message
 */
function sniper_worker(content, wlist, url, use_crypt) {
    return __awaiter(this, void 0, void 0, function () {
        var result_table, current_keyword, payload, result_2, content_length, status_code, error_1;
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
                    if (verbose) {
                        console.log("Testing: ".concat(current_keyword));
                    }
                    else { }
                    return [4 /*yield*/, snr(url, payload, use_crypt)];
                case 2:
                    result_2 = _a.sent();
                    content_length = (0, parsers_1.parse_content)(result_2);
                    status_code = (0, parsers_1.parse_status)(result_2);
                    result_table.push([current_keyword, content_length, status_code]);
                    if (verbose) {
                        console.log("Status_code: ".concat(status_code, ", Content_length: ").concat(content_length));
                    }
                    else { }
                    if (status_code === 200) {
                        console.log("Bingo! Current keyword: ".concat(current_keyword, ", yielded status code 200"));
                    }
                    else { }
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
////////////////////////
// RAM FUNCTIONS
////////////////////////
/**
 * ram_worker - worker function for ram attack mode, this worker will for every word in the userlist,
 * for every word in the passlist send a request with both username and password paramteres injected on.
 * @param {string} content original payload to inject into
 * @param {Array} userlist list of usernames
 * @param {Array} passlist list of passwords
 * @param {URL} url url to target website
 * @param {boolean} use_crypt tls option true for use tls false for no tls
 * @complexity O(n*j) where n is length of userlist, j is length of passlist
 * @returns table of results for each request where each row contains [username, password, content length, status code]
 */
function ram_worker(content, userlist, passlist, url, use_crypt) {
    return __awaiter(this, void 0, void 0, function () {
        var result_table, current_username, payload, i, current_password, payload_acc, result_3, content_length, status_code, error_2;
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
                    payload_acc = (0, parsers_1.change_cl)(inject(payload, current_password, 'PASSFUZZ'));
                    if (verbose) {
                        console.log("Testing: ".concat(current_username, " : ").concat(current_password));
                    }
                    else { }
                    return [4 /*yield*/, snr(url, payload_acc, use_crypt)];
                case 3:
                    result_3 = _a.sent();
                    content_length = (0, parsers_1.parse_content)(result_3);
                    status_code = (0, parsers_1.parse_status)(result_3);
                    result_table.push([current_username, current_password, content_length, status_code]);
                    if (verbose) {
                        console.log("Status_code: ".concat(status_code, ", Content_length: ").concat(content_length));
                    }
                    else { }
                    if (status_code === 200) {
                        console.log("Bingo! Current Username and password: ".concat(current_username, ":").concat(current_password, ", yielded 200"));
                    }
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
/**
 * ram - ram attack mode main function, used to create workers and run them in parallel
 * @returns {PromiseSettledResult} Result from running the worker functions in parallel
 */
function ram() {
    return __awaiter(this, void 0, void 0, function () {
        var passlist, passwords, userlist, usernames, username_chunks, worker_promises, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Create worker array
                    if (!(args.pl || args.passlist)) {
                        print_error('Missing required argument --passlist=');
                    }
                    else { }
                    passlist = fs.readFileSync(String(args.pl ? args.pl : args.passlist), 'utf-8');
                    passwords = passlist.split("\n").map(function (p) { return p.trim(); }).filter(function (p) { return p !== ""; });
                    if (!(args.ul || args.userlist)) {
                        print_error('Missing required argument --userlist=');
                    }
                    else { }
                    userlist = fs.readFileSync(String(args.ul ? args.ul : args.userlist), 'utf-8');
                    usernames = userlist.split("\n").map(function (p) { return p.trim(); }).filter(function (p) { return p !== ""; });
                    if (usernames.length < number_of_workers) {
                        print_error("Cant use more workers than there are usernames, reduce number of workers");
                    }
                    else { }
                    username_chunks = pass_chunk(usernames, number_of_workers);
                    worker_promises = username_chunks.map(function (user_chunk) {
                        return ram_worker(content, user_chunk, passwords, url, url.protocol === 'https:' ? true : false);
                    });
                    return [4 /*yield*/, Promise.allSettled(worker_promises)];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, result];
            }
        });
    });
}
//////////////////////
// SPYDER FUNCTIONS
/////////////////////
/** spyder - spyder main function used to create worker promises and run them in parallel
 *  @returns void - saves all files the crawler finds in a download directory
 */
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
/**
 * spyder_worker - worker function for spyder attack mode
 * @param {URL} base_url url to the target website to crawl.
 * @param {Set<string>} visited  a set of already visited endpoints
 * @param {Array<URL>} queue an array of urls to visit
 */
function spyder_worker(base_url, visited, queue) {
    return __awaiter(this, void 0, void 0, function () {
        var current, payload, response, body, links, _i, links_1, link, full_url, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!true) return [3 /*break*/, 5];
                    current = queue.shift();
                    if (!current) {
                        return [3 /*break*/, 5];
                    }
                    else { }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    console.log("Processing:", current.href);
                    payload = "GET ".concat(current.pathname + current.search, " HTTP/1.1\r\nHost: ").concat(base_url.host, "\r\nUser-Agent: Mozilla/5.0\r\nConnection: close\r\n\r\n");
                    return [4 /*yield*/, snr(current, payload, base_url.protocol === 'https:' ? true : false)];
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
                                else { }
                            }
                            else { }
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
    else { }
    if (!filePath.endsWith(".html")) {
        filePath += ".html";
    }
    else { }
    var fullPath = path.join("downloaded", filePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content);
}
///////////////
// MAIN
///////////////
console.log(banners_1.banner);
// Parse args and assign options to constants / variables
var args = (0, parsers_1.parse_args)();
var verbose = false;
if (args.help || args.h) {
    console.log(banners_1.sub_banner);
    console.log(banners_1.helpmsg);
    process.exit(0);
}
else { }
if (args.v || args.verbose) {
    verbose = true;
}
else { }
var raw_url = (_a = args.u) !== null && _a !== void 0 ? _a : args.url;
if (!raw_url) {
    print_error('Missing argument --url=');
}
else { }
var url = new url_1.URL(String((_b = args.url) !== null && _b !== void 0 ? _b : args.u));
var number_of_workers = args.w ? Number(args.w) : args.workers ? Number(args.workers) : 10;
var delay = args.d ? Number(args.d) : args.delay ? Number(args.delay) : 0;
var jitter = false;
if (verbose) {
    console.log(banners_1.sub_banner);
}
else { }
if (args.s || args.stealth) {
    delay = 1000;
    number_of_workers = 1;
}
else { }
if (args.j || args.jitter) {
    if (delay === 0) {
        print_error('Jitter (-j) argument can only be used in conjunction with delay (-d) argument!');
    }
    else { }
    jitter = true;
}
else { }
// Set attack mode and run attack
var result;
var mode = args.m ? args.m : args.mode;
var content;
/**
 * main - main function, chooses attackmode and saves result from attack to csv,
 * only reason this is a function is in order to use await command.
 */
function main() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(mode === 'sniper')) return [3 /*break*/, 2];
                    if (!(args.p || args.path)) {
                        print_error('Missing required argument --payload=');
                    }
                    else { }
                    console.log(banners_1.sniper_banner);
                    content = fs.readFileSync(String(args.p ? args.p : args.payload), 'utf-8');
                    return [4 /*yield*/, sniper()];
                case 1:
                    result = _a.sent();
                    save_to_csv(result);
                    return [3 /*break*/, 7];
                case 2:
                    if (!(mode === 'ram')) return [3 /*break*/, 4];
                    if (!(args.p || args.path)) {
                        print_error('Missing required argument --payload=');
                    }
                    else { }
                    console.log(banners_1.ram_banner);
                    content = fs.readFileSync(String(args.p ? args.p : args.payload), 'utf-8');
                    return [4 /*yield*/, ram()];
                case 3:
                    result = _a.sent();
                    save_to_csv(result);
                    return [3 /*break*/, 7];
                case 4:
                    if (!(mode === 'spyder')) return [3 /*break*/, 6];
                    console.log(banners_1.spyder_banner);
                    return [4 /*yield*/, spyder()];
                case 5:
                    _a.sent();
                    return [3 /*break*/, 7];
                case 6:
                    print_error('Missing argument --mode=');
                    _a.label = 7;
                case 7: return [2 /*return*/];
            }
        });
    });
}
main();
