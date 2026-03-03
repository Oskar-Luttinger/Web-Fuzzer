export function parse_args(): Record<string, string | boolean> {
    const args = process.argv.slice(2);
    const result: Record<string, string | boolean> = {};

    for (const arg of args) {
        if (!arg.includes('=')) {
            result[arg.slice(1)] = true;
        } else if (arg.startsWith('--')){
        const [key, value] = arg.slice(2).split("=");
        result[key] = value ?? true;
        } else if (arg.startsWith('-')){
            const [key, value] = arg.slice(1).split("=");
            result[key] = value ?? true;
        }
    }

    return result;
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
  if (payload_body === undefined) {
    console.log('what the helly')
    return payload_headers
  } else {
    console.log(payload_headers, payload_body)
    const new_cl = Buffer.byteLength(payload_body)
    return payload.replace(/content-length:\s*(\d+)/i, `Content-length: ${String(new_cl)}`)
  }
}


