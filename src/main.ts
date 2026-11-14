// Nama: name the URLs of a selection, copy them out. <>
import { type Editor, type Menu, type MenuItem, Plugin } from "obsidian";
import { copyUrls, insertUrl, nameUrls } from "./actions";
import { type NamaSettings, NamaTab, settingsFrom } from "./settings";
import { StripPatterns } from "./title";

interface Context {
  readonly editor: Editor;
  readonly strip: StripPatterns;
}

interface Action {
  readonly id: string;
  readonly name: string;
  readonly icon: string;
  readonly run: (context: Context) => Promise<void>;
}

const ACTIONS: readonly Action[] = [
  {
    id: "name-urls",
    name: "Name URLs",
    icon: "link",
    run: ({ editor, strip }) => nameUrls(editor, strip),
  },
  {
    id: "insert-url",
    name: "Insert URL",
    icon: "link-2",
    run: ({ editor }) => insertUrl(editor),
  },
  {
    id: "copy-first-url",
    name: "Copy first URL",
    icon: "copy",
    run: ({ editor }) => copyUrls(editor, 1),
  },
  {
    id: "copy-all-urls",
    name: "Copy all URLs",
    icon: "copy",
    run: ({ editor }) => copyUrls(editor),
  },
];

export default class Nama extends Plugin {
  override settings: NamaSettings = settingsFrom(null);

  override async onload() {
    this.settings = settingsFrom(await this.loadData());
    this.addSettingTab(new NamaTab(this.app, this));
    this.registerCommands();
    this.registerEvent(
      this.app.workspace.on("editor-menu", (menu, editor) => this.fillMenu(menu, editor)),
    );
  }

  async saveStrip(strip: string) {
    this.settings = { ...this.settings, strip };
    await this.saveData(this.settings);
  }

  private context(editor: Editor): Context {
    const strip = StripPatterns.parse(this.settings.strip);
    return { editor, strip };
  }

  private registerCommands() {
    for (const { id, name, run } of ACTIONS) {
      this.addCommand({ id, name, editorCallback: (editor) => run(this.context(editor)) });
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
      .onClick(() => run(this.context(editor)));
  }
}
