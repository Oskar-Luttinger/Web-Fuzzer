// Bendy sender

import net from "net";
import * as fs from 'fs';
import { URL } from 'url'; 
import { parse_args, parse_content, parse_status, change_cl } from "./parsers"
import tls from "tls"
import { worker } from "cluster";

const helpmsg = `
It looks like you need some help. (*) marks required arguments

Usage: 

bsender [-u=<url> | --url=<url>]* [-m=<sniper, ram, spyder> | --mode=<sniper, ram, spyder>]* 
[-p=<path to payload> | --payload<path to payload>]* [-ul=<path to username wordlist> | --userlist=<path to username wordlist>] 
[-pl=<path to password wordlist> | --passlist<path to password wordlist>] [-wl=<path wordlist> | --wordlist=<path wordlist>]
[-w=<number of workers> | --workers=<number of workers>]
[-o=<path to output> | --output=<path to output>] [-d=<ms> | --delay=<ms>]
[-h  | --help] [-s | --stealth] [-v | --verbose]
[-vv | --very_verbose] [-j | --jitter]

Description of arguments and values:

--url = url AND port to send payload to. Ex: http://test.com:80

--userlist = APPLIES TO RAM MODE: path to list of usernames to use in the attack. Ex: C:\\Users\\Attacker\\user-list.txt. 

--passlist = APPLIES TO RAM MODE | SNIPER MODE: path to list of passwords to use in the attack

--wordlist = APPLIES TO SNIPER MODE: path to list of words to inject into the payload

--workers = number of concurrent workers to run. Recommended: 20

--output = path to write the output csv file to.

--delay = sets a delay between each request in every worker. Note: All workers will still send their request at 
          the same time so it is not stealthy to have a long sleep but a high amount of workers.

--mode = sets attack mode:
            <sniper> = Fuzzes one parameter
            <ram> = fuzzes two parameters. For every word in the userlist it will try every word in the pass list 
            <spyder> = crawl the target domain recursively

            <help> = displays this message

--stealth = sets the fuzzer to send only one request / second to reduce noise.

--jitter = REQUIRES THE SLEEP ARGUMENT: adds random intervals between sleep and sleep * 4 for each request to disrupt patterns. 

--verbose | --very_verbose = increases the verbosity of the program i.e how much info it prints.
`


function inject(request : string, keyword: string, fuzzmarker?: string): string {
    if (!fuzzmarker) {
        fuzzmarker = 'FUZZ'
    }

    const [prefix, suffix] = request.split(fuzzmarker)
    const payload = prefix + keyword + suffix
    return payload
} 


function tls_snr(url: URL, payload: string): Promise<string> {
    return new Promise((resolve, reject) => {
        try {
            let buffer = ''
            const wsock = tls.connect({host: url.hostname, port: Number(url.port), rejectUnauthorized: false}, ()=>{})
            wsock.on('secureConnect', ()=> {
                wsock.write(payload, 'utf-8')
            })
            wsock.on('data', function crec(chunk) {
                buffer += chunk 
                if (Buffer.byteLength(buffer, 'utf-8') > Number(parse_content(buffer))) {
                    wsock.off('data', crec)
                    wsock.end()
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


function snr(url: URL, payload: string, use_crypt: boolean): Promise<string> {
    return new Promise((resolve, reject) => {
        try {
            let buffer = ''
            let wsock: net.Socket | tls.TLSSocket;
            if (use_crypt === false) {
                wsock = net.connect({host: url.hostname, port: Number(url.port)})
                wsock.on('connect', ()=> {
                    wsock.write(payload, 'utf-8')
                })
            } else {
                wsock = tls.connect({host: url.hostname, port: Number(url.port), rejectUnauthorized: false})
                wsock.on('secureConnect', ()=> {
                wsock.write(payload, 'utf-8')
            })
            }
                wsock.on('data', function crec(chunk) {
                    buffer += chunk 
                    if (Buffer.byteLength(buffer, 'utf-8') > Number(parse_content(buffer))) {
                        wsock.off('data', crec)
                        wsock.end()
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



function pass_chunk(chunk: Array<string>, num_workers: number): Array<Array<string>> {
    let password_chunks = []
    const len = chunk.length/num_workers
    for(let i = 0; num_workers > i; i = i+1){
        password_chunks.push(chunk.splice(0, len))
    }
    return password_chunks
}

async function sniper_worker(content: string, wlist: Array<string>, url: URL, use_crypt: boolean) {
    try {    
        let result_table = []
        while (wlist !== undefined && wlist.length > 0) {
            let current_keyword = wlist.shift()
            if (current_keyword !== undefined) {
                let payload = change_cl(inject(content, current_keyword))
                let result = await snr(url, payload, use_crypt)
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


async function sniper() {
    // Create worker array
    let worker_promises
    if (url.protocol === 'https:') {
        worker_promises = pass_chunk(wlist, number_of_workers).map(chunk => sniper_worker(content, chunk, url, true));
    } else {
        worker_promises = pass_chunk(wlist, number_of_workers).map(chunk => sniper_worker(content, chunk, url, false));
    }

    let result = await Promise.allSettled(worker_promises)
    return result
}

// Save to csv
function save_to_csv(result: PromiseSettledResult<(string | number | null)[][] | undefined>[]) {
    let file_path
    if (args.o || args.output) {
        file_path = args.o ? args.o : args.output
    } else {
        file_path = 'output.csv'
    }

    const csvhead = 'KEYWORD, RESPONSE LENGTH, RESPONSE CODE'
    fs.writeFile(file_path, csvhead, 'utf8', (err) => {
      if (err) {
        console.error('Error writing to CSV file', err);
      } else {
        console.log(`Headers saved!`);
      }
    });

    for (const r of result) {
        if (r.status === 'fulfilled') {
            const worker_data = r.value!.map(row => row.join(',')).join('\n');
            fs.appendFile(file_path, '\n' + worker_data, 'utf8', (err) => {
              if (err) {
                console.error('Error appending to CSV file', err);
              } else {
                console.log(`Data appended.`);
              }
            });
        } else {
            console.log('Worker failed')
        }
    }
}

// return selected function
function mode_select(mode: string): () => Promise<any> {
    return mode === 'sniper' 
        ? sniper
        : mode === 'ram'
        ? ram
        : spyder
}

// Parse args and assign options to constants / variables
const args = parse_args()
if (args.help || args.h) {
    console.log(helpmsg)
    process.exit(0)
}

const content: string = fs.readFileSync(String(args.path), 'utf-8'); // Synchronous function, rest of program will wait until finished
const url = new URL(String(args.url))
const passwords: string = fs.readFileSync(String(args.wlist), 'utf-8'); 
let wlist = passwords.split("\n").map(p => p.trim()).filter(p => p !== ""); // Split password string into an array
const number_of_workers = args.workers || args.w ? Number(args.workers) : 10
const attack = mode_select(args.m ? args.m : args.mode)
attack()





