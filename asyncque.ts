import * as fs from 'fs';
import { parse_args } from "./argparse";

const args = parse_args()
const passwords: string = fs.readFileSync(args.worst_password, 'utf-8'); 
let queue = passwords.split("\n").map(p => p.trim()).filter(p => p !== "");