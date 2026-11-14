import type { Editor } from "obsidian";
import { Region } from "../editor";
import { type Edit, embed, rewrite } from "../markdown";
import { notEmbedded, type UrlSpan } from "../urls";
import { clipboardUrl } from "./clipboard";
import { count, say } from "./notice";

const embedEdit = (span: UrlSpan): Edit => ({ span, written: embed(span.name, span.url) });

function embedSpans(region: Region, spans: readonly UrlSpan[]) {
  const edits = spans.map(embedEdit);
  const enriched = rewrite(region.text, edits);
  region.replace(enriched);
  say(`enriched ${count(spans, "URL")}`);
}

async function embedClipboard(editor: Editor) {
  const url = await clipboardUrl();
  if (!url) {
    say("no URL to enrich");
    return;
  }
  const cursor = Region.cursor(editor);
  const written = embed("", url);
  cursor.replace(written);
  cursor.moveCursor(written.length);
}

/** Embeds every URL of the selection or line; on a line without one, the clipboard's URL. */
export async function enrichUrls(editor: Editor) {
  const region = Region.selection(editor);
  const spans = notEmbedded(region.text);
  if (spans.length > 0) {
    embedSpans(region, spans);
    return;
  }
  if (editor.somethingSelected()) {
    say("no URL to enrich");
    return;
  }
  await embedClipboard(editor);
}
