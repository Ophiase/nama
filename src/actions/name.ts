import type { Editor } from "obsidian";
import { Region } from "../editor";
import { type Edit, escaped, link, rewrite } from "../markdown";
import { fetchTitles, type StripPatterns, type Titled } from "../title";
import { bareUrls, notEmbedded, type UrlSpan } from "../urls";
import { count, say } from "./notice";

function outcome(titled: readonly Titled[]) {
  const failed = titled.filter(({ title }) => title === null).length;
  const named = titled.length - failed;
  const summary = `${named} named`;
  return failed ? `${summary}, ${failed} failed` : summary;
}

const linkEdit = ({ span, title }: Titled): Edit[] =>
  title === null ? [] : [{ span, written: link(escaped(title), span.url) }];

async function applyTitles(region: Region, spans: readonly UrlSpan[], strip: StripPatterns) {
  const titled = await fetchTitles(spans, strip);
  if (region.stale) {
    say("text changed, aborted");
    return;
  }
  const edits = titled.flatMap(linkEdit);
  const named = rewrite(region.text, edits);
  region.replace(named);
  say(outcome(titled));
}

async function titleUrls(editor: Editor, strip: StripPatterns, pick: typeof bareUrls) {
  const region = Region.selection(editor);
  const spans = pick(region.text);
  if (spans.length === 0) {
    say("no URL to name");
    return;
  }
  const total = count(spans, "URL");
  say(`naming ${total}…`);
  await applyTitles(region, spans, strip);
}

/** Names every bare URL of the selection or line. */
export const nameUrls = (editor: Editor, strip: StripPatterns) =>
  titleUrls(editor, strip, bareUrls);

/** Names every URL of the selection or line not embedded, replacing the names it had. */
export const replaceUrls = (editor: Editor, strip: StripPatterns) =>
  titleUrls(editor, strip, notEmbedded);
