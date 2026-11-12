const MARKER = /^\s*(?:>\s*)*(?:#{1,6}\s+|(?:[-*+]|\d+[.)])\s+(?:\[.\]\s+)?)?/;

const at = (line, ch) => ({ line, ch });

/** Where the text of `line` starts and ends, past its indent, quote, heading, list or task marker. */
export function textSpan(line) {
  const start = line.match(MARKER)[0].length;
  const text = line.slice(start).trimEnd();
  return { start, end: start + text.length };
}

function lineText(editor, line) {
  const span = textSpan(editor.getLine(line));
  return { from: at(line, span.start), to: at(line, span.end) };
}

function selected(editor) {
  const from = editor.getCursor("from");
  const to = editor.getCursor("to");
  const wraps = to.ch === 0 && to.line > from.line;
  const last = to.line - 1;
  const end = wraps ? at(last, editor.getLine(last).length) : to;
  return { from, to: end };
}

const covers = (range, text) =>
  range.from.line === range.to.line && range.from.ch <= text.from.ch && range.to.ch >= text.to.ch;

function trimmed(editor, range) {
  const text = editor.getRange(range.from, range.to);
  const lead = text.length - text.trimStart().length;
  const start = editor.posToOffset(range.from) + lead;
  const end = start + text.trim().length;
  return { from: editor.offsetToPos(start), to: editor.offsetToPos(end) };
}

function rangeOf(editor) {
  if (!editor.somethingSelected()) {
    return lineText(editor, editor.getCursor().line);
  }
  const range = selected(editor);
  const own = lineText(editor, range.from.line);
  return covers(range, own) ? own : trimmed(editor, range);
}

/** The text a link wraps: the selection, or the text of its line when it holds all of it or nothing. */
export class Anchor {
  constructor(editor) {
    this.editor = editor;
    this.range = rangeOf(editor);
    this.text = editor.getRange(this.range.from, this.range.to);
  }

  /** Writes `[text](url)` and returns the offset of its `(` and of its end. */
  wrap(url) {
    const link = `[${this.text}](${url})`;
    const start = this.editor.posToOffset(this.range.from);
    this.editor.replaceRange(link, this.range.from, this.range.to);
    const paren = start + this.text.length + 2;
    return { paren, end: start + link.length };
  }
}
