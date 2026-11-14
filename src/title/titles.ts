import type { UrlSpan } from "../urls";
import { fetchTitle } from "./fetch";
import type { StripPatterns } from "./strip";

/** A span and the title of its URL, or null where none was found. */
export interface Titled {
  readonly span: UrlSpan;
  readonly title: string | null;
}

async function cleanTitle(url: string, strip: StripPatterns) {
  try {
    const title = await fetchTitle(url);
    return strip.clean(title) || null;
  } catch {
    return null;
  }
}

async function titled(span: UrlSpan, strip: StripPatterns): Promise<Titled> {
  const title = await cleanTitle(span.url, strip);
  return { span, title };
}

export const fetchTitles = (spans: readonly UrlSpan[], strip: StripPatterns) =>
  Promise.all(spans.map((span) => titled(span, strip)));
