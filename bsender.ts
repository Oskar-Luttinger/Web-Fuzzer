// Bendy sender

import net from "net";
import tls from "tls";
import * as fs from 'fs';
import * as readline from "readline/promises"
import {stdin as input, stdout as output } from "process";
import { send_raw } from "./hello_web";
import { URL } from 'url'; 



// Parse cmdline arguments
export function parse_args(): Record<string, string>  {
    const args = process.argv.slice(2); // Returns an array [--arg=value, --arg1=value, ...]
    let args_record: Record<string, string> = {}
    args.forEach((arg) => {
        let [key, value]: string[] = arg.replace('--', '').split('=');
        args_record[key] = value; // Inserts argument key and its value into args record
    })  
    return args_record;
}

export function inject(request : string, keyword: string, fuzzmarker?: string): string {
    if (!fuzzmarker) {
        fuzzmarker = 'FUZZ'
    }

    const [prefix, suffix] = request.split(fuzzmarker)
    const payload = prefix + keyword + suffix
    return payload
} 

function worker(url: URL, wordlist: Array<string>, request: string, fuzzmarker?: string): void {
    console.log(url.hostname, Number(url.port))
    const wsocket = net.connect({host : url.hostname, port: Number(url.port)}, () => {
        wsocket.on('connect', () => {
            console.log('connected to server!')
            while (wordlist.length !== 1 || wordlist === undefined) {
                const keyword = wordlist.shift()
                if (keyword !== undefined) {
                    let payload = inject(request, keyword, fuzzmarker)
                    wsocket.write(payload, 'utf-8')
                    wsocket.on('data', (data)=> {
                        const data_len = data.length
                        const resp_code = Number(data.slice(8, 12))
                        const entry: Array<string|number> = [keyword, data_len, resp_code]
                        result_table.push(entry)
                    })
                    wsocket.on('error', console.error)
                }
            }
        })
    })
}

let result_table: Array<Array<string|number>> = []

function main() {
    // Get file path from user
    const args = parse_args()

    const content: string = fs.readFileSync(args.path, 'utf-8'); // Synchronous function, rest of program will wait until finished
    const url = new URL(args.url)
    const passwords: string = fs.readFileSync(args.wlist, 'utf-8'); 
    let wlist = passwords.split("\n").map(p => p.trim()).filter(p => p !== "");
    worker(url, wlist, content, 'FUZZ')
    console.log(result_table)

}



main();




