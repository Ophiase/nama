import { type Editor, Notice } from "obsidian";
import { enterInsert, leaveVisual, Region } from "./editor";
import { fetchCleanTitles, type StripPatterns } from "./title";
import { bareUrls, linked, soleUrl, type UrlSpan, urlsIn } from "./urls";

const say = (message: string) => new Notice(`Nama: ${message}`);

function count(items: readonly unknown[], noun: string) {
  const plural = items.length === 1 ? "" : "s";
  return `${items.length} ${noun}${plural}`;
}

function outcome(titles: readonly string[]) {
  const failed = titles.filter((title) => !title).length;
  const named = titles.length - failed;
  const summary = `${named} named`;
  return failed ? `${summary}, ${failed} failed` : summary;
}

async function applyTitles(region: Region, bare: readonly UrlSpan[], strip: StripPatterns) {
  const titles = await fetchCleanTitles(bare, strip);
  if (region.stale) {
    say("text changed, aborted");
    return;
  }
  const named = linked(region.text, bare, titles);
  region.replace(named);
  say(outcome(titles));
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
  const link = `[${anchor.text}](${url ?? ""})`;
  anchor.replace(link);
  if (url) {
    anchor.moveCursor(link.length);
    return;
  }
  anchor.moveCursor(anchor.text.length + 2);
  enterInsert(editor);
}
