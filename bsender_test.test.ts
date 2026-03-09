import {test, expect} from '@jest/globals';
import {inject, sleep, get_jitter, pass_chunk} from './bsender'


//function pass_chunk<T>(arr: T[], workers: number): T[][] {
//    const n = arr.length
//    const base_size = Math.floor(n / workers)
//    const remainder = n % workers
//    const result: T[][] = [];
//
//    let start = 0
//    for (let i = 0; i < workers; i++) {
//        const size = base_size + (i < remainder ? 1 : 0)
//        const chunk = arr.slice(start, start + size)
//        if (chunk.length > 0) {
//            result.push(chunk)
//            start += base_size
//        } else {}
//    }
//    return result;
//}
test("pass_chunk which divides an array between workers", () => {
    const arr = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27]
    const result = pass_chunk(arr, 7)
    expect(result).toEqual([[ 1, 2, 3, 4 ], [ 4, 5, 6, 7 ], [ 7, 8, 9, 10 ], [ 10, 11, 12, 13 ], [ 13, 14, 15, 16 ], [ 16, 17, 18, 19 ], [ 19, 20, 21 ]])
});