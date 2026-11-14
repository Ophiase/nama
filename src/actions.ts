import { type Editor, Notice } from "obsidian";
import { Anchor } from "./editor/anchor";
import { Selection } from "./editor/selection";
import { enterInsert, leaveVisual } from "./editor/vim";
import { fetchCleanTitles } from "./title";
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

async function applyTitles(
  selection: Selection,
  bare: readonly UrlSpan[],
  patterns: readonly string[],
) {
  const titles = await fetchCleanTitles(bare, patterns);
  if (selection.stale) {
    say("text changed, aborted");
    return;
  }
  const named = linked(selection.text, bare, titles);
  selection.replace(named);
  say(outcome(titles));
}

export async function nameUrls(editor: Editor, patterns: readonly string[]) {
  const selection = new Selection(editor);
  const bare = bareUrls(selection.text);
  if (bare.length === 0) {
    say("no bare URL");
    return;
  }
  const total = count(bare, "URL");
  say(`naming ${total}…`);
  await applyTitles(selection, bare, patterns);
}

async function copy(urls: readonly string[]) {
  const lines = urls.join("\n");
  const summary = urls.length === 1 ? urls[0] : count(urls, "URL");
  await navigator.clipboard.writeText(lines);
  say(`copied ${summary}`);
}

export async function copyUrls(editor: Editor, limit?: number) {
  const selection = new Selection(editor);
  const found = urlsIn(selection.text);
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

function placeCursor(editor: Editor, offset: number) {
  const cursor = editor.offsetToPos(offset);
  editor.setCursor(cursor);
  editor.focus();
}

export async function insertUrl(editor: Editor) {
  const url = await clipboardUrl();
  const anchor = new Anchor(editor);
  leaveVisual(editor);
  const link = anchor.wrap(url ?? "");
  if (url) {
    placeCursor(editor, link.end);
    return;
  }
  placeCursor(editor, link.paren);
  enterInsert(editor);
}
