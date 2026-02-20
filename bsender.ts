// Bendy sender

import net from "net";
import tls from "tls";
import * as fs from 'fs';
import * as readline from "readline/promises"
import {stdin as input, stdout as output } from "process";

const rl = readline.createInterface({input, output})

function parse_args(): Record<string, string>  {
    const args = process.argv.slice(2); // Returns an array [--arg=value, --arg1=value, ...]
    let args_record: Record<string, string> = {}
    args.forEach((arg) => {
        let [key, value]: string[] = arg.replace('--', '').split('=');
        args_record[key] = value; // Inserts argument key and its value into args record
    })
    return args_record;
}

async function main() {
    // Get file path from user
    const args = parse_args()

    const content: string = fs.readFileSync(args.path, 'utf-8'); // Synchronous function, rest of program will wait until finished
    // Split request into two parts, prefix and suffix using fuzzmarker
    const fuzzmarker = 'FUZZ'
    const [prefix, suffix] = content.split(fuzzmarker)
    const string = prefix + '' + suffix
    console.log(string)


}

main();




