import { type Editor, Notice } from "obsidian";
import { enterInsert, leaveVisual, Region } from "./editor";
import { type Edit, escaped, link, parenOf, rewrite } from "./markdown";
import { fetchTitles, type StripPatterns, type Titled } from "./title";
import { bareUrls, soleUrl, type UrlSpan, urlsIn } from "./urls";

const say = (message: string) => new Notice(`Nama: ${message}`);

function count(items: readonly unknown[], noun: string) {
  const plural = items.length === 1 ? "" : "s";
  return `${items.length} ${noun}${plural}`;
}

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

async function copy(urls: readonly string[]) {
  const lines = urls.join("\n");
  const summary = urls.length === 1 ? urls[0] : count(urls, "URL");
  await navigator.clipboard.writeText(lines);
  say(`copied ${summary}`);
}

export async function copyUrls(editor: Editor, limit?: number) {
  const region = Region.selection(editor);
  const found = urlsIn(region.text);
  const urls = found.slice(0, limit);
  if (urls.length === 0) {
    say("no URL");
    return;
  }
  await copy(urls);
}

async function clipboardUrl() {
  const text = await navigator.clipboard.readText().catch(() => "");
  return soleUrl(text);
}

export async function insertUrl(editor: Editor) {
  const url = await clipboardUrl();
  const anchor = Region.anchor(editor);
  leaveVisual(editor);
  const written = link(anchor.text, url ?? "");
  anchor.replace(written);
  if (url) {
    anchor.moveCursor(written.length);
    return;
  }
  anchor.moveCursor(parenOf(anchor.text));
  enterInsert(editor);
}
