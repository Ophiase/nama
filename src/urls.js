// [text](url) | <url> | bare url
const TOKEN =
  /\[[^\]]*\]\((https?:\/\/[^)\s]+)\)|<(https?:\/\/[^>\s]+)>|(https?:\/\/[^\s<>()[\]]+)/g;

const trimTail = (url) => url.replace(/[.,;:!?'"]+$/, "");

function spanOf(match) {
  const [whole, named, angled, raw] = match;
  const url = trimTail(named ?? angled ?? raw);
  const length = raw ? url.length : whole.length;
  return { url, bare: !named, start: match.index, end: match.index + length };
}

/** Every URL of `text`, with its span; `bare` when it has no name yet. */
export const findUrls = (text) => [...text.matchAll(TOKEN)].map(spanOf);

export const urlsIn = (text) => findUrls(text).map((span) => span.url);

export const bareUrls = (text) => findUrls(text).filter((span) => span.bare);

/** `text` with each bare span replaced by a link to its title, when one was found. */
export function linked(text, bare, titles) {
  let out = text;
  for (const [index, span] of [...bare.entries()].reverse()) {
    if (titles[index]) {
      out = `${out.slice(0, span.start)}[${titles[index]}](${span.url})${out.slice(span.end)}`;
    }
  }
  return out;
}
