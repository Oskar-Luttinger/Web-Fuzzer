
import {test, expect} from '@jest/globals';
import { parse_args, parse_content, parse_status, change_cl, get_body, get_url } from "./parsers"


test("parse_args parses flags and key=value", () => {
  process.argv = ["node", "script", "--port=8080", "-v", "--debug"];

  expect(parse_args()).toEqual({
    port: "8080",
    v: true,
    debug: true
  });
});

test("parse_content extracts content-length", () => {
  const header = "Content-Length: 123";
  expect(parse_content(header)).toBe("123");
});

test("parse_content returns null if missing", () => {
  expect(parse_content("Host: example.com")).toBeNull();
});


test("parse_status extracts HTTP status code", () => {
  const data = "HTTP/1.1 404 Not Found";
  expect(parse_status(data)).toBe(404);
});


test("change_cl updates content-length", () => {
  const payload =
    "Content-Length: 5\r\n\r\nhello world";

  const result = change_cl(payload);

  expect(result.includes("Content-length: 11")).toBe(true);
});


test("get_body extracts response body", () => {
  const response =
    "HTTP/1.1 200 OK\r\nContent-Length: 5\r\n\r\nhello";

  expect(get_body(response)).toBe("hello");
});


test("get_url extracts links from HTML", () => {
  const html =
    '<a href="https://example.com">Link</a><a href="/about">About</a>';

  expect(get_url(html)).toEqual([
    "https://example.com",
    "/about"
  ]);
});