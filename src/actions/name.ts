import type { Editor } from "obsidian";
import { Region } from "../editor";
import { type Edit, escaped, link, rewrite } from "../markdown";
import { fetchTitles, type StripPatterns, type Titled } from "../title";
import { bareUrls, type UrlSpan } from "../urls";
import { count, say } from "./notice";

function outcome(titled: readonly Titled[]) {
  const failed = titled.filter(({ title }) => title === null).length;
  const named = titled.length - failed;
  const summary = `${named} named`;
  return failed ? `${summary}, ${failed} failed` : summary;
}

const linkEdit = ({ span, title }: Titled): Edit[] =>
  title === null ? [] : [{ span, written: link(escaped(title), span.url) }];

async function applyTitles(region: Region, bare: readonly UrlSpan[], strip: StripPatterns) {
  const titled = await fetchTitles(bare, strip);
  if (region.stale) {
    say("text changed, aborted");
    return;
  }
  const edits = titled.flatMap(linkEdit);
  const named = rewrite(region.text, edits);
  region.replace(named);
  say(outcome(titled));
}

export async function nameUrls(editor: Editor, strip: StripPatterns) {
  const region = Region.selection(editor);
  const bare = bareUrls(region.text);
  if (bare.length === 0) {
    say("no bare URL");
    return;
  }
  const total = count(bare, "URL");
  say(`naming ${total}…`);
  await applyTitles(region, bare, strip);
}
