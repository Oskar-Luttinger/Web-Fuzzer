//import { snr } from "./bsender.ts"
import net from "net"
import { parse_args, parse_content, parse_status, change_cl } from "./parsers"
import tls from "tls"
import * as fs from "fs"
import * as path from "path"


function snr(url: URL, payload: string, use_crypt: boolean): Promise<string> {
    return new Promise((resolve, reject) => {
        try {
            let buffer = ''
            let wsock: net.Socket | tls.TLSSocket;
            const port = url.port
                ? Number(url.port)
                : (use_crypt ? 443 : 80);
            if (use_crypt === false) {
                wsock = net.connect({host: url.hostname, port})
                wsock.on('connect', ()=> {
                    wsock.write(payload, 'utf-8')
                })
            } else {
                wsock = tls.connect({host: url.hostname, port, rejectUnauthorized: false})
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

function get_body(response : string) : string {
    const index = response.indexOf("\r\n\r\n")
    return response.slice(index + 4)
}


function get_url(html : string) : string[]{
    const links : string [] = [];
    const regex = /href="([^"]+)"/gi
    
    let match;
    while((match = regex.exec(html)) !== null) {
        links.push(match[1]);
    }
    return links
}


const queue: URL [] = [];
const visited = new Set<string>();


async function worker(base_url: URL) {
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
            const response = await snr(current, payload, true);
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


async function start() {
    const baseUrl = new URL("https://en.wikipedia.org/wiki/Billel_Benaldjia");
    visited.add(baseUrl.href);
    queue.push(baseUrl);
    const workers = 5; // change to 10 or 20 if you want
    const workerPromises = [];
    for (let i = 0; i < workers; i++) {
        workerPromises.push(worker(baseUrl));
    }
    await Promise.all(workerPromises);
    console.log("Crawling finished");
}

start();
