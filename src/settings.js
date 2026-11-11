import { PluginSettingTab, Setting } from "obsidian";

const SITES =
  "YouTube|SensCritique|Wikipedia|Wikipédia|IMDb|Reddit|Spotify|Genius|Bandcamp|SoundCloud|GitHub|Medium";
const VIDEO = String.raw`official\s+(?:music\s+)?(?:video|audio|clip)|(?:music|lyrics?)\s+video|visuali[sz]er|clip\s+officiel`;
const NOISE = String.raw`official|lyrics?|audio|video|clip|visuali[sz]er|remaster(?:ed)?|\d{4}\s+remaster(?:ed)?|hd|hq|4k|explicit|mv`;

export const DEFAULTS = {
  strip: [
    String.raw`\s*\[[^\]]*\]`,
    String.raw`\s*【[^】]*】`,
    String.raw`\s*#[\p{L}\p{N}_-]+`,
    String.raw`\s*\p{Extended_Pictographic}`,
    String.raw`\s*\((?:${NOISE})\b[^)]*\)`,
    String.raw`\s*(?:[|\-–—·:]\s*)?(?:${VIDEO})\b.*$`,
    String.raw`\s*[|\-–—·]\s*(?:${SITES})\s*$`,
    String.raw`^\s*[|\-–—·:]+\s*|\s*[|\-–—·:]+\s*$`,
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
      })
      .addExtraButton((button) =>
        button
          .setIcon("reset")
          .setTooltip("Restore the default patterns")
          .onClick(async () => {
            this.plugin.settings.strip = DEFAULTS.strip;
            await this.plugin.saveData(this.plugin.settings);
            this.display();
          }),
      );
  }
}
