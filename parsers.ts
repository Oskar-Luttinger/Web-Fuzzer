
export function parse_args(): Record<string, string>  {
    const args = process.argv.slice(2);
    let args_record: Record<string, string> = {}
    args.forEach((arg) => {
        let [key, value]: string[] = arg.replace('--', '').split('=');
        args_record[key] = value;
    })
    return args_record;
}

export function parse_content(header: string): string | null {
    const match = header.match(/content-length:\s*(\d+)/i);
    return match ? match[1] : null;
}

export function parse_status(data: string): number | null {
    const match = data.match(/HTTP\/\d\.\d\s+(\d+)/i);
    return match ? Number(match[1]) : null;
}

const chunk = `HTTP/1.1 4044 Unauthorized
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 59
ETag: W/"3b-Qjmp5F/nEZbGoS3IF1NZY+C5op0"
Date: Tue, 24 Feb 2026 16:04:19 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"success":false,"message":"Invalid username or password."}`


console.log(parse_status(chunk))