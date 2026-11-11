import { requestUrl } from "obsidian";

const YOUTUBE = /(^|\.)(youtube\.com|youtu\.be)$/;

function decode(buffer, contentType = "") {
  const bytes = new Uint8Array(buffer);
  const head = new TextDecoder("latin1").decode(bytes.slice(0, 4096));
  const charset =
    /charset=([\w-]+)/i.exec(contentType)?.[1] ??
    /<meta[^>]+charset=["']?([\w-]+)/i.exec(head)?.[1] ??
    "utf-8";
  try {
    return new TextDecoder(charset).decode(bytes);
  } catch {
    return new TextDecoder("utf-8").decode(bytes);
  }
}

async function youtubeTitle(url) {
  const endpoint = "https://www.youtube.com/oembed"; // hardcoded-url: YouTube's one public oEmbed endpoint
  const query = new URLSearchParams({ format: "json", url });
  return (await requestUrl({ url: `${endpoint}?${query}` })).json.title ?? "";
}

async function pageTitle(url) {
  const response = await requestUrl({ url, headers: { "Accept-Language": "fr,en;q=0.8" } });
  const html = decode(response.arrayBuffer, response.headers["content-type"]);
  const doc = new DOMParser().parseFromString(html, "text/html");
  const og = doc.querySelector('meta[property="og:title"]')?.getAttribute("content");
  return (og || doc.title || "").trim();
}

export const fetchTitle = (url) =>
  YOUTUBE.test(new URL(url).hostname) ? youtubeTitle(url) : pageTitle(url);

/** Strip every pattern, normalize, escape what would break a markdown link. */
export function cleanTitle(title, patterns) {
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
