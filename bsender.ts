// Bendy sender

import net from "net";
import * as fs from 'fs';
import { URL } from 'url'; 
import { parse_args, parse_content, parse_status, change_cl } from "./parsers"

function inject(request : string, keyword: string, fuzzmarker?: string): string {
    if (!fuzzmarker) {
        fuzzmarker = 'FUZZ'
    }

    const [prefix, suffix] = request.split(fuzzmarker)
    const payload = prefix + keyword + suffix
    return payload
} 

function snr(url: URL, payload: string): Promise<string> {
    return new Promise((resolve, reject) => {
        try {
            let buffer = ''
            const wsock = net.connect({host: url.hostname, port: Number(url.port)}, ()=>{})
            wsock.on('connect', ()=> {
                wsock.write(payload, 'utf-8')
            })
            wsock.on('data', function crec(chunk) {
                buffer += chunk 
                if (Buffer.byteLength(buffer, 'utf-8') > Number(parse_content(buffer))) {
                    wsock.off('data', crec)
                    resolve(buffer)
                }
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


async function worker(content: string, wlist: Array<string>, url: URL) {
    try {    
        let result_table = []
        while (wlist !== undefined && wlist.length > 0) {
            let current_keyword = wlist.shift()
            console.log(current_keyword)
            if (current_keyword) {
                let payload = change_cl(inject(content, current_keyword))
                let result = await snr(url, payload)
                console.log(result)
                let content_length = Number(parse_content(result))
                let status_code = parse_status(result)
                result_table.push([current_keyword, content_length, status_code])
                }
            }
        return result_table
        }  catch (error) {
           console.log(error)
    }
}


// Get file path from user
const args = parse_args()
const content: string = fs.readFileSync(args.path, 'utf-8'); // Synchronous function, rest of program will wait until finished
const url = new URL(args.url)
const passwords: string = fs.readFileSync(args.wlist, 'utf-8'); 
let wlist = passwords.split("\n").map(p => p.trim()).filter(p => p !== "");

async function print_result() {
    let result = await Promise.allSettled([worker(content, wlist, url)])
    console.log(result)
}

print_result()

