// Teast
import { parse_args } from "./argparse";
import { URL } from 'url';
import net from "net";
import * as fs from 'fs';

const args = parse_args()
const content: string = fs.readFileSync(args.path, 'utf-8');
const url = new URL(args.url)

async function TNR(url: URL, payload: string) {
    const wsock = net.connect({host: url.hostname, port: Number(url.port)}, ()=>{})
    let head_buff = ''
    let body_buff = ''

    wsock.on('connect', () => {
        console.log('Connected! Sending payload...')
        wsock.write(payload, 'utf-8')
    })

    function recv() {
        return new Promise((resolve, reject) => {
            try {
                wsock.on('data', function crec(chunk) {
                    head_buff += chunk
                    if (head_buff.length > 10) {
                    wsock.off('data', crec)
                    resolve('recieved!')
            } 
                })
            } catch (error) {
                  console.log(error)
                  reject(error)
            } 
        })
    }
    wsock.on('error', (error) => {
        console.log(error)
        wsock.end()
    })
    let recvieved = await recv()
    console.log(recvieved)
    console.log(head_buff)

}

TNR(url, content)
