// Nama: name the URLs of a selection, copy them out. <>
import { Plugin } from "obsidian";
import { copyUrls, insertUrl, nameUrls } from "./actions.js";
import { DEFAULTS, NamaTab, patterns } from "./settings.js";

const ACTIONS = [
  {
    id: "name-urls",
    name: "Name URLs",
    icon: "link",
    run: (nama, editor) => nameUrls(editor, patterns(nama.settings)),
  },
  {
    id: "insert-url",
    name: "Insert URL",
    icon: "link-2",
    run: (_nama, editor) => insertUrl(editor),
  },
  {
    id: "copy-first-url",
    name: "Copy first URL",
    icon: "copy",
    run: (_nama, editor) => copyUrls(editor, 1),
  },
  {
    id: "copy-all-urls",
    name: "Copy all URLs",
    icon: "copy",
    run: (_nama, editor) => copyUrls(editor),
  },
];

export default class Nama extends Plugin {
  async onload() {
    this.settings = { ...DEFAULTS, ...(await this.loadData()) };
    this.addSettingTab(new NamaTab(this.app, this));
    this.registerCommands();
    this.registerEvent(
      this.app.workspace.on("editor-menu", (menu, editor) => this.fillMenu(menu, editor)),
    );
  }

  registerCommands() {
    for (const { id, name, run } of ACTIONS) {
      this.addCommand({ id, name, editorCallback: (editor) => run(this, editor) });
    }
  }

  fillMenu(menu, editor) {
    for (const action of ACTIONS) {
      menu.addItem((item) => this.menuItem(item, action, editor));
    }
  }

  menuItem(item, { name, icon, run }, editor) {
    item
      .setTitle(name)
      .setIcon(icon)
      .onClick(() => run(this, editor));
  }
}
