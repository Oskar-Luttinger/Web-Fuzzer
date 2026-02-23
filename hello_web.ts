// hello web!
import net from 'net';
import * as fs from 'fs';
import { parse_args } from './argparse.ts';
import { URL } from 'url'; 

const args = parse_args()
const payload: string = fs.readFileSync(args.path, 'utf-8');
const url: string = args.url
const wordlist_unparsed: string = fs.readFileSync(args.list, 'utf-8');



function send_raw(payload: string, urlstr: string, wordlist: Array<String>): void {
    const url = new URL(urlstr)
    const socket = net.createConnection({host : url.hostname, port : Number(url.port)}, () => {
        console.log('Connected to server!')
    })

    socket.on('connect', () => {
        socket.write(payload, 'utf-8')
    })

    socket.on('data', (data) => {
        console.log(data.toString());
    });

    socket.on('error', console.error);
}

