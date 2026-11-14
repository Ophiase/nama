import type { Editor } from "obsidian";
import { Region } from "../editor";
import { urlsIn } from "../urls";
import { count, say } from "./notice";

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
