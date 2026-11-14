import { requestUrl } from "obsidian";
import type { UrlSpan } from "./urls";

const YOUTUBE = /(^|\.)(youtube\.com|youtu\.be)$/;

interface OEmbed {
  title?: string;
}

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

async function youtubeTitle(url: string) {
  const endpoint = "https://www.youtube.com/oembed"; // hardcoded-url: YouTube's one public oEmbed endpoint
  const query = new URLSearchParams({ format: "json", url });
  const response = await requestUrl({ url: `${endpoint}?${query}` });
  const body: OEmbed = response.json;
  return body.title ?? "";
}

async function pageTitle(url: string) {
  const response = await requestUrl({ url, headers: { "Accept-Language": "fr,en;q=0.8" } });
  const html = decode(response.arrayBuffer, response.headers["content-type"]);
  const doc = new DOMParser().parseFromString(html, "text/html");
  const og = doc.querySelector('meta[property="og:title"]')?.getAttribute("content");
  return (og || doc.title || "").trim();
}

export const fetchTitle = (url: string) =>
  YOUTUBE.test(new URL(url).hostname) ? youtubeTitle(url) : pageTitle(url);

/** Strip every pattern, normalize, escape what would break a markdown link. */
export function cleanTitle(title: string, patterns: readonly string[]) {
  let clean = title.normalize("NFC");
  for (const pattern of patterns) {
    try {
      clean = clean.replace(new RegExp(pattern, "giu"), "");
    } catch {
      // an invalid pattern is skipped, not fatal
    }
  }
  return clean.replace(/\s+/g, " ").trim().replace(/[[\]]/g, "\\$&");
}

async function fetchCleanTitle(url: string, patterns: readonly string[]) {
  try {
    return cleanTitle(await fetchTitle(url), patterns);
  } catch {
    return "";
  }
}

/** The cleaned title of each span, or "" where fetching it failed. */
export const fetchCleanTitles = (spans: readonly UrlSpan[], patterns: readonly string[]) =>
  Promise.all(spans.map((span) => fetchCleanTitle(span.url, patterns)));
