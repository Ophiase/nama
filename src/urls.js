// [text](url) | <url> | bare url
const TOKEN =
  /\[[^\]]*\]\((https?:\/\/[^)\s]+)\)|<(https?:\/\/[^>\s]+)>|(https?:\/\/[^\s<>()[\]]+)/g;

const trimTail = (url) => url.replace(/[.,;:!?'"]+$/, "");

/** Every URL of `text`, with its span; `bare` when it has no name yet. */
export function findUrls(text) {
  return [...text.matchAll(TOKEN)].map((m) => {
    const [whole, named, angled, raw] = m;
    const url = trimTail(named ?? angled ?? raw);
    const length = raw ? url.length : whole.length;
    return { url, bare: !named, start: m.index, end: m.index + length };
  });
}
