import {
  type App,
  type ExtraButtonComponent,
  PluginSettingTab,
  Setting,
  type TextAreaComponent,
} from "obsidian";
import type Nama from "./main";
import { StripPatterns } from "./title";

export interface NamaSettings {
  readonly strip: string;
}

/** The settings `saved` holds, the defaults for what it lacks or holds wrong. */
export function settingsFrom(saved: unknown): NamaSettings {
  const strip =
    typeof saved === "object" && saved !== null && "strip" in saved ? saved.strip : null;
  return { strip: typeof strip === "string" ? strip : StripPatterns.defaults };
}

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
    area.setValue(this.plugin.settings.strip).onChange((value) => this.plugin.saveStrip(value));
    area.inputEl.rows = 10;
    area.inputEl.cols = 50;
  }

  private resetButton(button: ExtraButtonComponent) {
    button
      .setIcon("reset")
      .setTooltip("Restore the default patterns")
      .onClick(() => this.reset());
  }

  private async reset() {
    await this.plugin.saveStrip(StripPatterns.defaults);
    this.display();
  }
}
