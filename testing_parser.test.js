"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var globals_1 = require("@jest/globals");
var parsers_1 = require("./parsers");
(0, globals_1.test)("parse_args parses flags and key=value", function () {
    process.argv = ["node", "script", "--port=8080", "-v", "--debug"];
    (0, globals_1.expect)((0, parsers_1.parse_args)()).toEqual({
        port: "8080",
        v: true,
        debug: true
    });
});
(0, globals_1.test)("parse_content extracts content-length", function () {
    var header = "Content-Length: 123";
    (0, globals_1.expect)((0, parsers_1.parse_content)(header)).toBe(123);
});
(0, globals_1.test)("parse_content returns null if missing", function () {
    (0, globals_1.expect)((0, parsers_1.parse_content)("Host: example.com")).toBeNull();
});
(0, globals_1.test)("parse_status extracts HTTP status code", function () {
    var data = "HTTP/1.1 404 Not Found";
    (0, globals_1.expect)((0, parsers_1.parse_status)(data)).toBe(404);
});
(0, globals_1.test)("change_cl updates content-length", function () {
    var payload = "Content-Length: 5\r\n\r\nhello world";
    var result = (0, parsers_1.change_cl)(payload);
    (0, globals_1.expect)(result.includes("Content-Length: 11")).toBe(true);
});
(0, globals_1.test)("get_body extracts response body", function () {
    var response = "HTTP/1.1 200 OK\r\nContent-Length: 5\r\n\r\nhello";
    (0, globals_1.expect)((0, parsers_1.get_body)(response)).toBe("hello");
});
(0, globals_1.test)("get_url extracts links from HTML", function () {
    var html = '<a href="https://example.com">Link</a><a href="/about">About</a>';
    (0, globals_1.expect)((0, parsers_1.get_url)(html)).toEqual([
        "https://example.com",
        "/about"
    ]);
});
