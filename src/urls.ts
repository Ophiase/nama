// [text](url) | <url> | bare url
const TOKEN =
  /\[[^\]]*\]\((https?:\/\/[^)\s]+)\)|<(https?:\/\/[^>\s]+)>|(https?:\/\/[^\s<>()[\]]+)/g;

/** A URL of a text, where it sits, and whether it has no name yet. */
export interface UrlSpan {
  url: string;
  bare: boolean;
  start: number;
  end: number;
}

const trimTail = (url: string) => url.replace(/[.,;:!?'"]+$/, "");

function spanOf(match: RegExpExecArray): UrlSpan {
  const [whole, named, angled, raw] = match;
  const url = trimTail(named ?? angled ?? raw ?? "");
  const length = raw ? url.length : whole.length;
  return { url, bare: !named, start: match.index, end: match.index + length };
}

/** Every URL of `text`, with its span; `bare` when it has no name yet. */
export const findUrls = (text: string): UrlSpan[] => [...text.matchAll(TOKEN)].map(spanOf);

export const urlsIn = (text: string) => findUrls(text).map((span) => span.url);

/** The URL `text` is made of, alone, or null. */
export function soleUrl(text: string): string | null {
  const trimmed = text.trim();
  const [span, ...rest] = findUrls(trimmed);
  const whole = span && rest.length === 0 && span.start === 0 && span.end === trimmed.length;
  return whole ? span.url : null;
}

export const bareUrls = (text: string) => findUrls(text).filter((span) => span.bare);

/** `text` with each bare span replaced by a link to its title, when one was found. */
export function linked(text: string, bare: readonly UrlSpan[], titles: readonly string[]) {
  let out = text;
  for (const [index, span] of [...bare.entries()].reverse()) {
    if (titles[index]) {
      out = `${out.slice(0, span.start)}[${titles[index]}](${span.url})${out.slice(span.end)}`;
    }
  }
  return out;
}
