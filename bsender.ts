// Bendy sender

import net from "net";
import tls from "tls";
import * as fs from 'fs';
import * as readline from "readline/promises"
import {stdin as input, stdout as output } from "process";
import { send_raw } from "./hello_web";
import { URL } from 'url'; 
import { parse_args, parse_content } from "./parsers"

function inject(request : string, keyword: string, fuzzmarker?: string): string {
    if (!fuzzmarker) {
        fuzzmarker = 'FUZZ'
    }

    const [prefix, suffix] = request.split(fuzzmarker)
    const payload = prefix + keyword + suffix
    return payload
} 

function snr(url: URL, payload: string) {
    return new Promise((resolve, reject) => {
        try {
            let buffer = ''
            const wsock = net.connect({host: url.hostname, port: Number(url.port)}, ()=>{})
            wsock.on('connect', ()=> {
                wsock.write(payload, 'utf-8')
            })
            wsock.on('data', function crec(chunk) {
                buffer += chunk 
                if (buffer.length > Number(parse_content(buffer)))
                    wsock.off('data', crec)
                    resolve(buffer)
            })
            wsock.on('error', (error) => {
                wsock.end()
                reject(error)
            })
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
}


let result_table: Array<Array<string|number>> = []

async function worker(content, wlist) {
    return new Promise((resolve, reject) => {
        while (true)
        if (wlist.is_empty) {
            resolve('Done!')

        }
    }
}

 // Get file path from user
 const args = parse_args()
 const content: string = fs.readFileSync(args.path, 'utf-8'); // Synchronous function, rest of program will wait until finished
 const url = new URL(args.url)
 const passwords: string = fs.readFileSync(args.wlist, 'utf-8'); 
 let wlist = passwords.split("\n").map(p => p.trim()).filter(p => p !== "");
 



