// Baby sender

import * as net from "net";
import * as fs from 'fs';
import { URL } from 'url'; 
import { parse_args, parse_content, parse_status, change_cl, get_body, get_url } from "./parsers"
import * as tls from "tls"
import * as path from 'path'
import { banner, sub_banner, spyder_banner, sniper_banner, ram_banner, helpmsg } from "./banners";

////////////////////
// HELPER FUNCTIONS
////////////////////

/**
 * Inject - Replaces a fuzzmarker in a string with a keyword
 * @example inject('this is a FUZZ text', short, FUZZ) will return 
 *          'this is a short text'
 * @param {string} request the request to inject the keyword into
 * @param {string} keyword the keyword to inject
 * @param {string} fuzzmarker a string inside the request to replace with the keyword
 * @returns string where fuzzmarker is replaced by a keyword
 */

function inject(request : string, keyword: string, fuzzmarker?: string): string {
    if (!fuzzmarker) {
        fuzzmarker = 'FUZZ'
    }
    const [prefix, suffix] = request.split(fuzzmarker)
    const payload = prefix + keyword + suffix
    return payload
} 

/**
 * Sleep - pauses program execution for given amount of miliseconds by only
 * resolving the promise after given time has passed
 * @param {number} ms amount of milliseconds to wait for
 * @returns Promise
 */

function sleep(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}
/**
 * get_jitter - returns a random number between base sleep ( delay global var)
 * and base sleep * 8
 * @param base_sleep 
 * @returns number between base sleep and base sleep * 8
 */
function get_jitter(base_sleep: number): number {
    const min = base_sleep;
    const max = base_sleep * 8;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * print_error - Prints out an error message and exits the program 
 * @param error error string to print
 */
function print_error(error: string) {
    console.log(`ERROR: ${error}\n`)
    process.exit(1)
}

/**
 * pass_chunk splits an array into a table where each row is a section
 * of the original array
 * @example pass_chunk([1, 2, 3, 4, 5, 6, 7, 8, 9], 3)
 *          results in [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
 * @param arr array to split
 * @param workers number of chunks / rows to split original array into
 * @returns A table where each row is a section of arr 
 */

function pass_chunk<T>(arr: T[], workers: number): T[][] {
    const size = Math.ceil(arr.length / workers);
    const result: T[][] = [];

    for (let i = 0; i < workers; i++) {
        result.push(arr.slice(i * size, (i + 1) * size));
    }

    return result;
}

/**
 * save_to_csv saves result from a Promise.Allsettled call table to a csv file,
 * @param {PromiseSettledResult} result A PromiseSettledResult eg. an array of records. 
 * @returns void - But it saves result to a new csv file 'output.csv unless args.output is defined. 
 */
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

////////////////////////
// NETWORK FUNCTION
////////////////////////
/**
 * Snr - (send and recieve) sends a payload to the given url and resloves with the response or error
 * @param {URL} url url to target
 * @param {string} payload http payload to send
 * @param {boolean} use_crypt tls option false for no tls true for tls
 * @returns raw response http OR error message
 */
function snr(url: URL, payload: string, use_crypt: boolean): Promise<string> {
    
    return new Promise((resolve, reject) => {
        try {
            let buffer = '';
            let wsock: net.Socket | tls.TLSSocket;

            const port = url.port ? Number(url.port) : (use_crypt ? 443 : 80);
            const host = url.hostname;

            if (use_crypt === false) {
                wsock = net.connect({ host, port });
                wsock.on('connect', () => {
                    wsock.write(payload, 'utf-8');
                });
            } else {
                wsock = tls.connect({ host, port, rejectUnauthorized: false });
                wsock.on('secureConnect', () => {
                    wsock.write(payload, 'utf-8');
                });
            }

            wsock.on('data', function crec(chunk) {
                buffer += chunk.toString('utf-8');
                
                // Check that we have recieved *enough* data
                try {
                    const contentLength = Number(parse_content(buffer));
                    if (!isNaN(contentLength) && Buffer.byteLength(buffer, 'utf-8') >= contentLength) {
                        wsock.off('data', crec);
                        wsock.end();
                        resolve(buffer);
                    }
                } catch (e) {
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

            // Prevent dead-hangs
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

//////////////////////
// SNIPER FUNCTIONS
//////////////////////

/**
 * sniper - sniper attack mode main funciton, used to create workers and run them.
 * @returns Result from running the worker functions in parallel
 */

async function sniper() {
    // Create worker array
    if (!(args.w || args.wlist)){
    print_error('Missing required argument --wlist=')
    } 
    const passwords: string = fs.readFileSync(String(args.wlist ? args.wlist : args.wl), 'utf-8'); 
    let wlist = passwords.split("\n").map(p => p.trim()).filter(p => p !== ""); // Split password string into an array

    // Create an array of function calls to sniper_worker where each worker gets a separete chunk from the wordlist to process
    let worker_promises = pass_chunk(wlist, number_of_workers).map(chunk => sniper_worker(content, chunk, url, url.protocol === 'https:' ? true : false));
    let result = await Promise.allSettled(worker_promises)
    return result
}

/**
 * sniper_worker - worker function for sniper attack mode, 
 * for every word in the wordlist it injects it into the payload, sends the payload, returns a table where each row contains 
 * [keyword, content lenght, status code] for each request sent.
 * @param {string} content the original captured payload
 * @param {Array} wlist the wordlist to inject from
 * @param {URL} url the url to the target site
 * @param {boolean} use_crypt tls options, true for use tls else false.
 * @returns a table of results from each sent message
 */
async function sniper_worker(content: string, wlist: Array<string>, url: URL, use_crypt: boolean) {
    try {    
        let result_table: Array<string|number|null>[] = []
        while (wlist !== undefined && wlist.length > 0) {
            let current_keyword: string = wlist.shift()!
            let payload = change_cl(inject(content, current_keyword!))
            if (verbose) {
                console.log(`Testing: ${current_keyword}`)
            }
            let result = await snr(url, payload, use_crypt)
            let content_length: number = parse_content(result)
            let status_code: number|null = parse_status(result)
            result_table.push([current_keyword, content_length, status_code])
            if (verbose) {
                console.log(`Status_code: ${status_code}, Content_length: ${content_length}`)
            }
            await sleep(jitter ? get_jitter(delay) : delay)
            }
        return result_table
        }  catch (error) {
    }
}

////////////////////////
// RAM FUNCTIONS
////////////////////////
/**
 * ram_worker - worker function for ram attack mode, this worker will for every word in the userlist, 
 * for every word in the passlist send a request with both username and password paramteres injected on.
 * @param {string} content original payload to inject into
 * @param {Array} userlist list of usernames
 * @param {Array} passlist list of passwords
 * @param {URL} url url to target website
 * @param {boolean} use_crypt tls option true for use tls false for no tls
 * @complexity O(n*j) where n is length of userlist, j is length of passlist
 * @returns table of results for each request where each row contains [username, password, content length, status code]
 */
async function ram_worker(content: string, userlist: Array<string>, passlist: Array<string> ,url: URL, use_crypt: boolean) {
    try {    
        let result_table = []
        while (userlist !== undefined && userlist.length > 0) {
            let current_username = userlist.shift()
            let payload = inject(content, current_username!, 'USERFUZZ')
            for(let i = 0; i < passlist.length; i += 1) {
                let current_password = passlist[i]
                const payload_acc = change_cl(inject(payload, current_password!, 'PASSFUZZ'))
                if (verbose) {
                    console.log(`Testing: ${current_username} : ${current_password}`)
                }
                let result = await snr(url, payload_acc, use_crypt)
                let content_length = parse_content(result)
                let status_code = parse_status(result)
                result_table.push([current_username, current_password, content_length, status_code])
                if (verbose) {
                    console.log(`Status_code: ${status_code}, Content_length: ${content_length}`)
                } else {}
                await sleep(jitter ? get_jitter(delay) : delay)
                }
            }  
        return result_table
        }  catch (error) {
           console.log(error)
    }
}

/**
 * ram - ram attack mode main function, used to create workers and run them in parallel
 * @returns {PromiseSettledResult} Result from running the worker functions in parallel 
 */
async function ram() {
    // Create worker array
    if (!(args.pl || args.passlist)){
    print_error('Missing required argument --passlist=')
    } 
    const passlist: string = fs.readFileSync(String(args.pl ? args.pl : args.passlist), 'utf-8')
    let passwords = passlist.split("\n").map(p => p.trim()).filter(p => p !== "");

    if (!(args.ul || args.userlist)){
    print_error('Missing required argument --userlist=')
    }       
    const userlist = fs.readFileSync(String(args.ul ? args.ul : args.userlist), 'utf-8')
    let usernames = userlist.split("\n").map(p => p.trim()).filter(p => p !== "");

    let username_chunks = pass_chunk(usernames, number_of_workers)
    
    // Create an array of function calls to ram_worker which will be an array of promises 
    // used in the call to Promise.allSettled
    const worker_promises = username_chunks.map((user_chunk) => {
        return ram_worker(content, user_chunk, passwords, url, url.protocol === 'https:' ? true : false);
    });
    let result = await Promise.allSettled(worker_promises)
    return result
}


//////////////////////
// SPYDER FUNCTIONS
/////////////////////
/** spyder - spyder main function used to create worker promises and run them in parallel
 *  @returns void - saves all files the crawler finds in a download directory
 */
async function spyder(): Promise<void> {
    const queue: URL [] = [];
    const visited = new Set<string>();
    visited.add(url.href);
    queue.push(url);
    const workers = 5; // change to 10 or 20 if you want
    const workerPromises = [];
    for (let i = 0; i < workers; i++) {
        workerPromises.push(spyder_worker(url, visited, queue));
    }
    await Promise.all(workerPromises);
    console.log("Crawling finished");
}

/**
 * spyder_worker - worker function for spyder attack mode 
 * @param {URL} base_url url to the target website to crawl.
 * @param {Set<string>} visited  a set of already visited endpoints
 * @param {Array<URL>} queue an array of urls to visit
 */
async function spyder_worker(base_url: URL, visited: Set<string>, queue: Array<URL>) {
    while (true) {
        const current = queue.shift();
        if (!current) break;
        try {
            console.log("Processing:", current.href);
            const payload = `GET ${current.pathname + current.search} HTTP/1.1\r
Host: ${base_url.host}\r
User-Agent: Mozilla/5.0\r
Connection: close\r
\r
`;
            const response = await snr(current, payload, base_url.protocol === 'https:' ? true : false);
            const body = get_body(response);
            save_page(current, body);
            const links = get_url(body);
            for (const link of links) {
                try {
                    const full_url = new URL(link, base_url);
                    if (full_url.host === base_url.host) {
                        if (!visited.has(full_url.href)) {
                            visited.add(full_url.href);
                            queue.push(full_url);
                        }
                    }
                } catch {
                    // Ignore invalid URLs
                }
            }
        } catch (err) {
            console.log("Worker error:", err);
        }
    }
}

function save_page(url: URL, content: string) {
    let filePath = url.pathname;

    if (filePath === "/") {
        filePath = "/index.html";
    }

    if (!filePath.endsWith(".html")) {
        filePath += ".html";
    }

    const fullPath = path.join("downloaded", filePath);

    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content);
}

///////////////
// MAIN
///////////////

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

const raw_url = args.u ?? args.url
if (!raw_url) {
    print_error('Missing argument --url=')
}
const url = new URL(String(args.url ?? args.u))

let number_of_workers = args.w ? Number(args.w) : args.workers ? Number(args.workers) : 10
let delay = args.d ? Number(args.d) : args.delay ? Number(args.delay)  : 0
let jitter: boolean = false

if (verbose) {
    console.log(sub_banner)
}

if (args.s || args.stealth) {
    delay = 1000
    number_of_workers = 1
}

if (args.j || args.jitter) {
    if (delay = 0) {
        print_error('Jitter (-j) argument can only be used in conjunction with delay (-d) argument!')
    }
    jitter = true
}

// Set attack mode and run attack
let result:  PromiseSettledResult<(string | number | null | undefined)[][] | undefined>[];
const mode = args.m ? args.m : args.mode

let content : string

/**
 * main - main function, chooses attackmode and saves result from attack to csv, 
 * only reason this is a function is in order to use await command.
 */
async function main(): Promise<void> {
    if (mode === 'sniper') {
        if (!(args.p || args.path)){
            print_error('Missing required argument --payload=')
        } 
        console.log(sniper_banner)
        content = fs.readFileSync(String(args.p ? args.p : args.payload), 'utf-8'); 
        result = await sniper()
        save_to_csv(result)
    } else if (mode === 'ram') {
        if (!(args.p || args.path)){
            print_error('Missing required argument --payload=')
        } 
        console.log(ram_banner)
        content = fs.readFileSync(String(args.p ? args.p : args.payload), 'utf-8'); 
        result = await ram()
        save_to_csv(result)
    } else if (mode === 'spyder') {
        console.log(spyder_banner)
        await spyder()
    } else {
        print_error('Missing argument --mode=')
    }
}

main()






