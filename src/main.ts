// Nama: name the URLs of a selection, copy them out. <>
import { type Editor, type Menu, type MenuItem, Plugin } from "obsidian";
import { copyUrls, insertUrl, nameUrls } from "./actions";
import { DEFAULTS, type NamaSettings, NamaTab } from "./settings";
import { StripPatterns } from "./title";

interface Action {
  id: string;
  name: string;
  icon: string;
  run: (nama: Nama, editor: Editor) => Promise<void>;
}

const ACTIONS: readonly Action[] = [
  {
    id: "name-urls",
    name: "Name URLs",
    icon: "link",
    run: (nama, editor) => nameUrls(editor, StripPatterns.parse(nama.settings.strip)),
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
  override settings: NamaSettings = { ...DEFAULTS };

  override async onload() {
    const saved: Partial<NamaSettings> | null = await this.loadData();
    this.settings = { ...DEFAULTS, ...saved };
    this.addSettingTab(new NamaTab(this.app, this));
    this.registerCommands();
    this.registerEvent(
      this.app.workspace.on("editor-menu", (menu, editor) => this.fillMenu(menu, editor)),
    );
  }

  private registerCommands() {
    for (const { id, name, run } of ACTIONS) {
      this.addCommand({ id, name, editorCallback: (editor) => run(this, editor) });
    }
  }

  private fillMenu(menu: Menu, editor: Editor) {
    for (const action of ACTIONS) {
      menu.addItem((item) => this.menuItem(item, action, editor));
    }
  }

  private menuItem(item: MenuItem, { name, icon, run }: Action, editor: Editor) {
    item
      .setTitle(name)
      .setIcon(icon)
      .onClick(() => run(this, editor));
  }
}
