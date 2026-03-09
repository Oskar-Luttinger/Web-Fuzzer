import {test, expect} from '@jest/globals';

// Because the need of global variables we need to have the functions in here. 
// So we cant show coverage but we can show that they work.

function pass_chunk<T>(arr: T[], workers: number): T[][] {
    const n = arr.length
    const base_size = Math.floor(n / workers)
    const remainder = n % workers
    const result: T[][] = [];

    let start = 0
    for (let i = 0; i < workers; i++) {
        const size = base_size + (i < remainder ? 1 : 0)
        const chunk = arr.slice(start, start + size)
        if (chunk.length > 0) {
            result.push(chunk)
            start += base_size
        } else {}
    }
    return result;
}
test("pass_chunk which divides an array between workers", () => {
    const arr = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27]
    const result = pass_chunk(arr, 7)
    expect(result).toEqual([[ 1, 2, 3, 4 ], [ 4, 5, 6, 7 ], [ 7, 8, 9, 10 ], [ 10, 11, 12, 13 ], [ 13, 14, 15, 16 ], [ 16, 17, 18, 19 ], [ 19, 20, 21 ]])
});


function inject(request : string, keyword: string, fuzzmarker?: string): string {
    if (!fuzzmarker) {
        fuzzmarker = 'FUZZ'
    } else {}
    const [prefix, suffix] = request.split(fuzzmarker)
    const payload = prefix + keyword + suffix
    return payload
} 
test("inject which replaces a fuzzmarker in a string with a keyword", () => {
    const str = "This is a FUZZ text"
    const result = inject(str, "short", "FUZZ")
    expect(result).toBe("This is a short text")
})


function get_jitter(base_sleep: number): number {
    const min = base_sleep;
    const max = base_sleep * 8;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

test("get_jitter which returns a random between base_sleep and base_sleep*8", () => {
    expect(get_jitter(1000)).toBeGreaterThanOrEqual(1000)
    expect(get_jitter(1000)).toBeLessThanOrEqual(1000*8)  
})