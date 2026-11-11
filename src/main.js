// Nama: name the URLs of a selection, copy them out. <>
import { Notice, Plugin } from "obsidian";
import { DEFAULTS, NamaTab, patterns } from "./settings.js";
import { cleanTitle, fetchTitle } from "./title.js";
import { findUrls } from "./urls.js";

const ACTIONS = [
  { id: "name-urls", name: "Name URLs", icon: "link", run: (p, e) => p.nameUrls(e) },
  { id: "copy-first-url", name: "Copy first URL", icon: "copy", run: (p, e) => p.copyUrls(e, 1) },
  { id: "copy-all-urls", name: "Copy all URLs", icon: "copy", run: (p, e) => p.copyUrls(e) },
];

/** The selection, or the current line when nothing is selected. */
function scope(editor) {
  if (editor.somethingSelected()) {
    return { from: editor.getCursor("from"), to: editor.getCursor("to") };
  }
  const { line } = editor.getCursor();
  return { from: { line, ch: 0 }, to: { line, ch: editor.getLine(line).length } };
}

export default class Nama extends Plugin {
  async onload() {
    this.settings = { ...DEFAULTS, ...(await this.loadData()) };
    this.addSettingTab(new NamaTab(this.app, this));

    for (const { id, name, run } of ACTIONS) {
      this.addCommand({ id, name, editorCallback: (editor) => run(this, editor) });
    }
    this.registerEvent(
      this.app.workspace.on("editor-menu", (menu, editor) => {
        for (const { name, icon, run } of ACTIONS) {
          menu.addItem((item) =>
            item
              .setTitle(name)
              .setIcon(icon)
              .onClick(() => run(this, editor)),
          );
        }
      }),
    );
  }

  async nameUrls(editor) {
    const { from, to } = scope(editor);
    const text = editor.getRange(from, to);
    const bare = findUrls(text).filter((u) => u.bare);
    if (!bare.length) return new Notice("Nama: no bare URL");
    new Notice(`Nama: naming ${bare.length} URL(s)…`);

    const strip = patterns(this.settings);
    const titles = await Promise.all(
      bare.map((u) =>
        fetchTitle(u.url)
          .then((title) => cleanTitle(title, strip))
          .catch(() => ""),
      ),
    );
    if (editor.getRange(from, to) !== text) return new Notice("Nama: text changed, aborted");

    let out = text;
    for (const [i, u] of [...bare.entries()].reverse()) {
      if (titles[i]) out = `${out.slice(0, u.start)}[${titles[i]}](${u.url})${out.slice(u.end)}`;
    }
    editor.replaceRange(out, from, to);
    const named = titles.filter(Boolean).length;
    new Notice(
      `Nama: ${named} named${named < bare.length ? `, ${bare.length - named} failed` : ""}`,
    );
  }

  async copyUrls(editor, limit) {
    const { from, to } = scope(editor);
    const urls = findUrls(editor.getRange(from, to))
      .map((u) => u.url)
      .slice(0, limit);
    if (!urls.length) return new Notice("Nama: no URL");
    await navigator.clipboard.writeText(urls.join("\n"));
    new Notice(limit === 1 ? `Copied: ${urls[0]}` : `Copied ${urls.length} URL(s)`);
  }
}
