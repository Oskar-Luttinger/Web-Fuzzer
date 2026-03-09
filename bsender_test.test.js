"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var globals_1 = require("@jest/globals");
// Because the need of global variables we need to have the functions in here. 
// So we cant show coverage but we can show that they work.
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
            start += base_size;
        }
        else { }
    }
    return result;
}
(0, globals_1.test)("pass_chunk which divides an array between workers", function () {
    var arr = [1, 2, 1234, 12345, 1234567];
    var result = pass_chunk(arr, 3);
    (0, globals_1.expect)(result).toEqual([[1, 2], [1234, 12345], [1234567]]);
});
function inject(request, keyword, fuzzmarker) {
    if (!fuzzmarker) {
        fuzzmarker = 'FUZZ';
    }
    else { }
    var _a = request.split(fuzzmarker), prefix = _a[0], suffix = _a[1];
    var payload = prefix + keyword + suffix;
    return payload;
}
(0, globals_1.test)("inject which replaces a fuzzmarker in a string with a keyword", function () {
    var str = "This is a FUZZ text";
    var result = inject(str, "short", "FUZZ");
    (0, globals_1.expect)(result).toBe("This is a short text");
});
function get_jitter(base_sleep) {
    var min = base_sleep;
    var max = base_sleep * 8;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
(0, globals_1.test)("get_jitter which returns a random between base_sleep and base_sleep*8", function () {
    (0, globals_1.expect)(get_jitter(1000)).toBeGreaterThanOrEqual(1000);
    (0, globals_1.expect)(get_jitter(1000)).toBeLessThanOrEqual(1000 * 8);
});
