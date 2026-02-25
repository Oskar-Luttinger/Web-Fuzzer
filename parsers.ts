
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

export function change_cl(payload: string): string {
  const [payload_headers, payload_body] = payload.split('\r\n\r\n')
  console.log(payload_headers)
  const new_cl = Buffer.byteLength(payload_body)
  return payload.replace(/content-length:\s*(\d+)/i, `Content-length: ${String(new_cl)}`)
}
