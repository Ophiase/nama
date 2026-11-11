import { PluginSettingTab, Setting } from "obsidian";

export const DEFAULTS = {
  strip: [
    "\\s*\\[[^\\]]*\\]",
    "\\s*【[^】]*】",
    "\\s*\\((?:official\\s*)?(?:music\\s*)?(?:video|audio|clip|lyrics?|mv|hd|4k)[^)]*\\)",
    "\\s*[-|–—·]\\s*YouTube\\s*$",
    "\\s*[-|–—·]\\s*SensCritique\\s*$",
  ].join("\n"),
};

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
      .addTextArea((area) => {
        area.setValue(this.plugin.settings.strip).onChange(async (value) => {
          this.plugin.settings.strip = value;
          await this.plugin.saveData(this.plugin.settings);
        });
        area.inputEl.rows = 10;
        area.inputEl.cols = 50;
      });
  }
}
