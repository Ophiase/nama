import type { Editor } from "obsidian";
import { enterInsert, leaveVisual, Region } from "../editor";
import { link, parenOf } from "../markdown";
import { clipboardUrl } from "./clipboard";

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
