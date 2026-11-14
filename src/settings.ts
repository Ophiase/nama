import {
  type App,
  type ExtraButtonComponent,
  PluginSettingTab,
  Setting,
  type TextAreaComponent,
} from "obsidian";
import type Nama from "./main";
import strip from "./strip-patterns.txt";

export interface NamaSettings {
  strip: string;
}

export const DEFAULTS: Readonly<NamaSettings> = { strip: strip.trim() };

export const patterns = (settings: NamaSettings) =>
  settings.strip
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

export class NamaTab extends PluginSettingTab {
  constructor(
    app: App,
    private readonly plugin: Nama,
  ) {
    super(app, plugin);
  }

  override display() {
    this.containerEl.empty();
    new Setting(this.containerEl)
      .setName("Strip patterns")
      .setDesc("One regex per line, case-insensitive, removed from every title.")
      .addTextArea((area) => this.patternsArea(area))
      .addExtraButton((button) => this.resetButton(button));
  }

  private patternsArea(area: TextAreaComponent) {
    area.setValue(this.plugin.settings.strip).onChange((value) => this.saveStrip(value));
    area.inputEl.rows = 10;
    area.inputEl.cols = 50;
  }

  private resetButton(button: ExtraButtonComponent) {
    button
      .setIcon("reset")
      .setTooltip("Restore the default patterns")
      .onClick(() => this.reset());
  }

  private async saveStrip(value: string) {
    this.plugin.settings.strip = value;
    await this.plugin.saveData(this.plugin.settings);
  }

  private async reset() {
    await this.saveStrip(DEFAULTS.strip);
    this.display();
  }
}
