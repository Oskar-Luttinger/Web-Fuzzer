// Baby sender

import * as net from "net";
import * as fs from 'fs';
import { URL } from 'url'; 
import { parse_args, parse_content, parse_status, change_cl } from "./parsers"
import * as tls from "tls"


const banner = `

░▒▓███████▓▒░       ░▒▓█▓▒░░▒▓█▓▒░      ░▒▓███████▓▒░    ░▒▓█▓▒░░▒▓█▓▒░ 
░▒▓█▓▒░░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░   ░▒▓█▓▒░░▒▓█▓▒░ 
░▒▓█▓▒░░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░   ░▒▓█▓▒░░▒▓█▓▒░ 
░▒▓███████▓▒░       ░▒▓█▓▒░░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░    ░▒▓██████▓▒░  
░▒▓█▓▒░░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░      ░▒▓█▓▒░     
░▒▓█▓▒░░▒▓█▓▒░▒▓██▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓██▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓██▓▒░▒▓█▓▒░     
░▒▓█▓▒░░▒▓█▓▒░▒▓██▓▒░░▒▓██████▓▒░░▒▓██▓▒░▒▓███████▓▒░░▒▓██▓▒░▒▓█▓▒░     
                                                                   
`

const sub_banner = `

░█▀█░█▀▄░█▀▀░░░█░█░█▀█░█░█░░░█▀▄░█▀▀░█▀█░█▀▄░░░█░█░█▀▀░▀█▀░▀▀█
░█▀█░█▀▄░█▀▀░░░░█░░█░█░█░█░░░█░█░█▀▀░█▀█░█░█░░░░█░░█▀▀░░█░░░▀░
░▀░▀░▀░▀░▀▀▀░░░░▀░░▀▀▀░▀▀▀░░░▀▀░░▀▀▀░▀░▀░▀▀░░░░░▀░░▀▀▀░░▀░░░▀░

`

const helpmsg = `

    /‾‾\    
    |  |    
    @  @    
    || |/   
    || ||   
    |\\_/|   
    \\___/   
      /\\    
    /‾  ‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾\\  
    | It looks like you are trying to fuzz something |  
    | Would you like some help with that?            |  
    \\________________________________________________/  

Usage: 

bsender [-u=<url> | --url=<url>]* [-m=<sniper, ram, spyder> | --mode=<sniper, ram, spyder>]* 
[-p=<path to payload> | --payload<path to payload>]* [-ul=<path to username wordlist> | --userlist=<path to username wordlist>] 
[-pl=<path to password wordlist> | --passlist<path to password wordlist>] [-wl=<path wordlist> | --wordlist=<path wordlist>]
[-w=<number of workers> | --workers=<number of workers>]
[-o=<path to output> | --output=<path to output>] [-d=<ms> | --delay=<ms>]
[-h  | --help] [-s | --stealth] [-v | --verbose]
[-j | --jitter]

Description of arguments and values:

--url (*) = url AND port to send payload to. Ex: http://test.com:80

--payload (*) = path to raw http payload to inject into 

--userlist = APPLIES TO RAM MODE: path to list of usernames to use in the attack. Ex: C:\\Users\\Attacker\\user-list.txt. 

--passlist = APPLIES TO RAM MODE | SNIPER MODE: path to list of passwords to use in the attack

--wordlist = APPLIES TO SNIPER MODE: path to list of words to inject into the payload

--workers = number of concurrent workers to run. Recommended: 20

--output = path to write the output csv file to.

--delay = sets a delay between each request in every worker. Note: All workers will still send their request at 
          the same time so it is not stealthy to have a long sleep but a high amount of workers.

--mode (*) = sets attack mode:
            <sniper> = Fuzzes one parameter
            <ram> = fuzzes two parameters. For every word in the userlist it will try every word in the pass list 
            <spyder> = crawl the target domain recursively

            <help> = displays this message

--stealth = sets the fuzzer to send only one request / second to reduce noise.

--jitter = REQUIRES THE SLEEP ARGUMENT: adds random intervals between sleep and sleep * 8 for each request to disrupt patterns. 

--verbose = increases the verbosity of the program i.e how much info it prints.
`

function inject(request : string, keyword: string, fuzzmarker?: string): string {
    if (!fuzzmarker) {
        fuzzmarker = 'FUZZ'
    }
    const [prefix, suffix] = request.split(fuzzmarker)
    const payload = prefix + keyword + suffix
    return payload
} 

function sleep(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

function get_jitter(baseSleep: number): number {
    // Generate a random number between delay and delay * 8
    const min = baseSleep;
    const max = baseSleep * 8;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function print_error(error: string) {
    console.log(error)
    process.exit(1)
}


function snr(url: URL, payload: string, use_crypt: boolean): Promise<string> {
    console.log('HELLO FROM SNR!');
    
    return new Promise((resolve, reject) => {
        try {
            let buffer = '';
            let wsock: net.Socket | tls.TLSSocket;

            // 1. Hantera porten ordentligt (url.port är ofta tom sträng)
            const port = url.port ? Number(url.port) : (use_crypt ? 443 : 80);
            const host = url.hostname;

            // 2. Skapa anslutningen
            if (use_crypt === false) {
                wsock = net.connect({ host, port });
                wsock.on('connect', () => {
                    console.log('HELLO FROM NET HTTP');
                    // Se till att payload har HTTP-avslutning (\r\n\r\n)
                    wsock.write(payload, 'utf-8');
                });
            } else {
                wsock = tls.connect({ host, port, rejectUnauthorized: false });
                wsock.on('secureConnect', () => {
                    console.log('HELLO FROM TLS HTTPS');
                    wsock.write(payload, 'utf-8');
                });
            }

            // 3. Gemensamma händelselyssnare
            wsock.on('data', function crec(chunk) {
                console.log('DATA RECEIVED');
                buffer += chunk.toString('utf-8');
                
                // Kontrollera om vi har fått hela svaret
                // Obs: parse_content måste kunna hantera ofullständig buffer!
                try {
                    const contentLength = Number(parse_content(buffer));
                    if (!isNaN(contentLength) && Buffer.byteLength(buffer, 'utf-8') >= contentLength) {
                        wsock.off('data', crec);
                        wsock.end();
                        resolve(buffer);
                    }
                } catch (e) {
                    // Om parse_content kraschar för att headern inte är klar än, fortsätt vänta
                }
            });

            wsock.on('end', () => {
                resolve(buffer);
            });

            wsock.on('error', (error) => {
                console.error('Socket error:', error);
                wsock.destroy();
                reject(error);
            });

            // 4. Timeout-skydd (viktigt så promiset inte hänger för evigt)
            wsock.setTimeout(10000, () => {
                wsock.destroy();
                reject(new Error('Timeout after 10s'));
            });

        } catch (error) {
            console.log('Catch error:', error);
            reject(error);
        }
    });
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
            let payload = change_cl(inject(content, current_keyword!))
            let result = await snr(url, payload, use_crypt)
            let content_length = Number(parse_content(result))
            let status_code = parse_status(result)
            result_table.push([current_keyword, content_length, status_code])
            await sleep(jitter ? get_jitter(delay) : delay)
            }
        return result_table
        }  catch (error) {
    }
}

async function ram_worker(content: string, userlist: Array<string>, passlist: Array<string> ,url: URL, use_crypt: boolean) {
    try {    
        let result_table = []
        console.log(passlist)
        while (userlist !== undefined && userlist.length > 0) {
            let current_username = userlist.shift()
            let payload = inject(content, current_username!, 'USER')
            for(let i = 0; i < passlist.length; i += 1) {
                let current_password = passlist[i]
                console.log(current_password)
                payload = change_cl(inject(payload, current_password!, 'PASS'))
                console.log('GAAAA')
                let result = await snr(url, payload, use_crypt)
                console.log(result)
                console.log('hello??')
                let content_length = Number(parse_content(result))
                let status_code = parse_status(result)
                result_table.push([current_username, current_password, content_length, status_code])
                await sleep(jitter ? get_jitter(delay) : delay)
                }
            }  
        return result_table
        }  catch (error) {
           console.log(error)
    }
}


 async function sniper() {
    // Create worker array
    const passwords: string = fs.readFileSync(String(args.wlist ? args.wlist : args.w), 'utf-8'); 
    let wlist = passwords.split("\n").map(p => p.trim()).filter(p => p !== ""); // Split password string into an array

    let worker_promises = pass_chunk(wlist, number_of_workers).map(chunk => sniper_worker(content, chunk, url, url.protocol === 'https:' ? true : false));
    let result = await Promise.allSettled(worker_promises)
    return result
}


async function ram() {
    // Create worker array
    const passlist: string = fs.readFileSync(String(args.pl ? args.pl : args.passlist), 'utf-8')
    let passwords = passlist.split("\n").map(p => p.trim()).filter(p => p !== "");

    const userlist = fs.readFileSync(String(args.ul ? args.ul : args.userlist), 'utf-8')
    let usernames = userlist.split("\n").map(p => p.trim()).filter(p => p !== "");

    let username_chunks = pass_chunk(usernames, number_of_workers)
    let password_chunks = pass_chunk(passwords, number_of_workers)
    
    const worker_promises = username_chunks.map((user_chunk, index) => {
        const passw_chunk = password_chunks[index];
        return ram_worker(content, user_chunk, passw_chunk, url, url.protocol === 'https:' ? true : false);
    });
    console.log(worker_promises)
    let result = await Promise.allSettled(worker_promises)
    return result
}
1

// Save to csv
function save_to_csv(result: PromiseSettledResult<(string | number | null | undefined)[][] | undefined>[]) {
    let file_path: string
    let output = args.o ? args.o : args.output
    if (typeof output === 'string') {
        file_path = args.o ? String(args.o) : String(args.output)
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

function spyder() {
    console.log('hej')
}

console.log(banner)

// Parse args and assign options to constants / variables
const args = parse_args()
let verbose: boolean = false
if (args.help || args.h) {
    console.log(sub_banner)
    console.log(helpmsg)
    process.exit(0)
}

if (args.v || args.verbose) {
    verbose = true
}
console.log(args)
const content: string = fs.readFileSync(String(args.p ? args.p : args.payload), 'utf-8'); 
const url = new URL(String(args.url ? args.url : args.u))
let number_of_workers = args.w ? Number(args.w) : args.workers ? Number(args.workers) : 10
let delay = args.d ? Number(args.d) : args.delay ? Number(args.delay)  : 0
let jitter: boolean = false

if (args.s || args.stealth) {
    delay = 1000
    number_of_workers = 1
}

if (args.j || args.jitter) {
    jitter = true
}


// Set attack mode and run attack
let result:  PromiseSettledResult<(string | number | null | undefined)[][] | undefined>[];
const mode = args.m ? args.m : args.mode

async function main(): Promise<void> {
    if (mode === 'sniper') {
        result = await sniper()
        save_to_csv(result)
    } else if (mode === 'ram') {
        result = await ram()
        save_to_csv(result)
    }
}

main()






