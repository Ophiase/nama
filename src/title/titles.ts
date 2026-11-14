import type { UrlSpan } from "../urls";
import { fetchTitle } from "./fetch";
import type { StripPatterns } from "./strip";

const escaped = (title: string) => title.replace(/[[\]]/g, "\\$&");

async function fetchCleanTitle(url: string, strip: StripPatterns) {
  try {
    const title = await fetchTitle(url);
    return escaped(strip.clean(title));
  } catch {
    return "";
  }
}

/** The cleaned title of each span, or "" where fetching it failed. */
export const fetchCleanTitles = (spans: readonly UrlSpan[], strip: StripPatterns) =>
  Promise.all(spans.map((span) => fetchCleanTitle(span.url, strip)));
