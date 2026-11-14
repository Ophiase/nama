const TOKEN =
  /(?<bang>!?)\[(?<name>[^\]]*)\]\((?<linked>https?:\/\/[^)\s]+)\)|<(?<angled>https?:\/\/[^>\s]+)>|(?<raw>https?:\/\/[^\s<>()[\]]+)/g;

/** `url`, `<url>`, `[name](url)` or `![name](url)`. */
export type UrlForm = "bare" | "angled" | "named" | "embedded";

/** A URL of a text, how it is written and where; `name` is "" when it has none. */
export interface UrlSpan {
  readonly url: string;
  readonly form: UrlForm;
  readonly name: string;
  readonly start: number;
  readonly end: number;
}

interface Groups {
  bang?: string;
  name?: string;
  linked?: string;
  angled?: string;
  raw?: string;
}

const trimTail = (url: string) => url.replace(/[.,;:!?'"]+$/, "");

function formOf(groups: Groups): UrlForm {
  if (groups.linked) {
    return groups.bang ? "embedded" : "named";
  }
  return groups.angled ? "angled" : "bare";
}

function spanOf(match: RegExpExecArray): UrlSpan {
  const groups: Groups = match.groups ?? {};
  const url = trimTail(groups.linked ?? groups.angled ?? groups.raw ?? "");
  const length = groups.raw ? url.length : match[0].length;
  const name = groups.name ?? "";
  return { url, form: formOf(groups), name, start: match.index, end: match.index + length };
}

export const findUrls = (text: string): UrlSpan[] => [...text.matchAll(TOKEN)].map(spanOf);

export const urlsIn = (text: string) => findUrls(text).map((span) => span.url);

/** The URL `text` is made of, alone, or null. */
export function soleUrl(text: string): string | null {
  const trimmed = text.trim();
  const [span, ...rest] = findUrls(trimmed);
  const whole = span && rest.length === 0 && span.start === 0 && span.end === trimmed.length;
  return whole ? span.url : null;
}

const unnamed = (span: UrlSpan) => span.form === "bare" || span.form === "angled";

export const bareUrls = (text: string) => findUrls(text).filter(unnamed);

export const notEmbedded = (text: string) =>
  findUrls(text).filter((span) => span.form !== "embedded");
