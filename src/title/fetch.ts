import { requestUrl } from "obsidian";

const YOUTUBE = /(^|\.)(youtube\.com|youtu\.be)$/;

function charsetOf(bytes: Uint8Array, contentType: string) {
  const head = new TextDecoder("latin1").decode(bytes.slice(0, 4096));
  return (
    /charset=([\w-]+)/i.exec(contentType)?.[1] ??
    /<meta[^>]+charset=["']?([\w-]+)/i.exec(head)?.[1] ??
    "utf-8"
  );
}

function decode(buffer: ArrayBuffer, contentType = "") {
  const bytes = new Uint8Array(buffer);
  try {
    return new TextDecoder(charsetOf(bytes, contentType)).decode(bytes);
  } catch {
    return new TextDecoder("utf-8").decode(bytes);
  }
}

function titleOf(body: unknown) {
  const title = typeof body === "object" && body !== null && "title" in body ? body.title : null;
  return typeof title === "string" ? title : "";
}

async function youtubeTitle(url: string) {
  const endpoint = "https://www.youtube.com/oembed"; // hardcoded-url: YouTube's one public oEmbed endpoint
  const query = new URLSearchParams({ format: "json", url });
  const response = await requestUrl({ url: `${endpoint}?${query}` });
  return titleOf(response.json);
}

async function pageTitle(url: string) {
  const response = await requestUrl({ url, headers: { "Accept-Language": "fr,en;q=0.8" } });
  const html = decode(response.arrayBuffer, response.headers["content-type"]);
  const doc = new DOMParser().parseFromString(html, "text/html");
  const og = doc.querySelector('meta[property="og:title"]')?.getAttribute("content");
  return og || doc.title || "";
}

export const fetchTitle = (url: string) =>
  YOUTUBE.test(new URL(url).hostname) ? youtubeTitle(url) : pageTitle(url);
