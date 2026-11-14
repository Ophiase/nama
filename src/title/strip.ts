import defaults from "./strip-patterns.txt";

function compile(pattern: string) {
  try {
    return new RegExp(pattern, "giu");
  } catch {
    return null;
  }
}

const compiled = (pattern: RegExp | null): pattern is RegExp => pattern !== null;

/** The noise stripped from every title; a pattern that does not compile is dropped. */
export class StripPatterns {
  static readonly defaults = defaults.trim();

  private constructor(private readonly patterns: readonly RegExp[]) {}

  /** One regex per line, case-insensitive; blank lines are ignored. */
  static parse(source: string) {
    const lines = source.split("\n").map((line) => line.trim());
    const patterns = lines.filter(Boolean).map(compile).filter(compiled);
    return new StripPatterns(patterns);
  }

  /** `title` without any pattern, normalized, its whitespace collapsed. */
  clean(title: string) {
    const normalized = title.normalize("NFC");
    const stripped = this.patterns.reduce((text, pattern) => text.replace(pattern, ""), normalized);
    return stripped.replace(/\s+/g, " ").trim();
  }
}
