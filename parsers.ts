
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