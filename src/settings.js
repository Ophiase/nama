import { PluginSettingTab, Setting } from "obsidian";
import strip from "./strip-patterns.txt";

export const DEFAULTS = { strip: strip.trim() };

export const patterns = (settings) =>
  settings.strip
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

export class NamaTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    this.containerEl.empty();
    new Setting(this.containerEl)
      .setName("Strip patterns")
      .setDesc("One regex per line, case-insensitive, removed from every title.")
      .addTextArea((area) => this.patternsArea(area))
      .addExtraButton((button) => this.resetButton(button));
  }

  patternsArea(area) {
    area.setValue(this.plugin.settings.strip).onChange((value) => this.saveStrip(value));
    area.inputEl.rows = 10;
    area.inputEl.cols = 50;
  }

  resetButton(button) {
    button
      .setIcon("reset")
      .setTooltip("Restore the default patterns")
      .onClick(() => this.reset());
  }

  async saveStrip(value) {
    this.plugin.settings.strip = value;
    await this.plugin.saveData(this.plugin.settings);
  }

  async reset() {
    await this.saveStrip(DEFAULTS.strip);
    this.display();
  }
}
