import { Notice } from "obsidian";
import { Anchor } from "./editor/anchor.js";
import { Selection } from "./editor/selection.js";
import { enterInsert, leaveVisual } from "./editor/vim.js";
import { fetchCleanTitles } from "./title.js";
import { bareUrls, linked, soleUrl, urlsIn } from "./urls.js";

const say = (message) => new Notice(`Nama: ${message}`);

function count(items, noun) {
  const plural = items.length === 1 ? "" : "s";
  return `${items.length} ${noun}${plural}`;
}

function outcome(titles) {
  const failed = titles.filter((title) => !title).length;
  const named = titles.length - failed;
  const summary = `${named} named`;
  return failed ? `${summary}, ${failed} failed` : summary;
}

async function applyTitles(selection, bare, patterns) {
  const titles = await fetchCleanTitles(bare, patterns);
  if (selection.stale) {
    say("text changed, aborted");
    return;
  }
  const named = linked(selection.text, bare, titles);
  selection.replace(named);
  say(outcome(titles));
}

export async function nameUrls(editor, patterns) {
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

async function copy(urls) {
  const lines = urls.join("\n");
  const summary = urls.length === 1 ? urls[0] : count(urls, "URL");
  await navigator.clipboard.writeText(lines);
  say(`copied ${summary}`);
}

export async function copyUrls(editor, limit) {
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

function placeCursor(editor, offset) {
  const cursor = editor.offsetToPos(offset);
  editor.setCursor(cursor);
  editor.focus();
}

export async function insertUrl(editor) {
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
