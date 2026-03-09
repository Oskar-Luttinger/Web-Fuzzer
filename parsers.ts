

/**
 * Parses arguments from process.argv and returns them as a record with argument names and corresponding value
 * 
 * @example process.argv = ["node", "script", "--port=8080", "-v", "--debug"]
 * parse_args()
 * which result in {port: "8080", v: true, debug: true}
 * 
 * @complexity O(n) where n is the number of arguments.
 * 
 * @returns {Record<string,string | boolean>} Returns the stripped value as a record mapping arguments names to either their value or boolean.
 */

export function parse_args(): Record<string, string | boolean> {
    const args = process.argv.slice(2);
    const result: Record<string, string | boolean> = {};

    for (const arg of args) {
        if (arg.startsWith('--')){
        const [key, value] = arg.slice(2).split("=");
        result[key] = value ?? true;
        } else if (arg.startsWith('-')){
            const [key, value] = arg.slice(1).split("=");
            result[key] = value ?? true;
        } else if (!arg.includes('=')) {
            result[arg.slice(1)] = true;
        }
    }

    return result;
}

/**
 * Takes in a request-payload and uses regular expressions to extract content-length number
 * 
 * @example parse_content("Content-Length: 123")
 * // results in "123"
 * 
 * @param {string} header - http header of request-payload
 * 
 * @precondition header is valid http syntax
 * 
 * @complexity O(n) where n is the length of header
 * 
 * @returns {string | null} the content-length as a string or null
 */
export function parse_content(header: string): number | null {
    const match = header.match(/content-length:\s*(\d+)/i);
    return match ? Number(match[1]) : null;
}

/**
 * Takes in a response-payload and uses regular expressions to extract the status code
 * 
 * @example parse_status("HTTP/1.1 404 Not Found")
 * // results in 404
 * 
 * @param {string} data - http header of response-payload
 * 
 * @precondition header is valid http syntax
 * 
 * @complexity O(n) where n is the length of header
 * 
 * @returns {number | null} a number of the status code or null
 */



export function parse_status(data: string): number | null {
    const match = data.match(/HTTP\/\d\.\d\s+(\d+)/i);
    return match ? Number(match[1]) : null;
}

/**
 * It takes a payload and recounts the byte-length and returns the new content-length
 * 
 * @example change_cl("Content-Length: 5\r\n\r\nhello world")
 * // results in "Content-Length: 11"
 * 
 * @param {string} payload - http header of payload
 * 
 * @precondition payload is a valid http syntax
 * 
 * @complexity O(n) where n is the length of payload
 * 
 * @returns {string} returns the payload with the content-length changed to byte-length
 */

export function change_cl(payload: string): string {
  let [payload_headers, payload_body] = payload.split('\r\n\r\n')
  if (payload_body === undefined) {
    return payload_headers
  } else {
    const new_cl = Buffer.byteLength(payload_body)
    return payload.replace(/content-length:\s*(\d+)/i, `Content-length: ${String(new_cl)}`)
  }
}


/**
 * Takes in a http response-payload and returns the body of the payload
 * 
 * @example get_body("HTTP/1.1 200 OK\r\nContent-Length: 5\r\n\r\nhello")
 * // Results in hello
 * 
 * @param {string} response - http repsonse-payload
 * 
 * @precondition valid http syntax on the payload
 * 
 * @complexity O(n) where n is the length of response
 * 
 * @returns {string} returns the header of the payload 
 */

export function get_body(response : string) : string {
    const index = response.indexOf("\r\n\r\n")
    return response.slice(index + 4)
}


/**
 * Takes in a payload body and looks for href and saves the urls to an array
 * 
 * @example get_url("<a href="https://example.com">Link</a><a href="/about">About</a>")
 * //results in ["https://example.com", "/about"]
 * 
 * @precondition that html is a valid body in http syntax
 * 
 * @complexity O(n) where n is the length om html
 * 
 * @param {string} html - which is the hyperrefference
 * 
 * @returns {string[]} returns an array of strings with the urls
 */

export function get_url(html : string) : string[]{
    const matches = html.match(/href="([^"]+)"/gi)
    if(!matches) {
        return []
    } else {
        return matches.map(href => href.slice(6, -1));
    }
}