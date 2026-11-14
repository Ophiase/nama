import type { Editor, EditorPosition, EditorRange } from "obsidian";

const MARKER = /^\s*(?:>\s*)*(?:#{1,6}\s+|(?:[-*+]|\d+[.)])\s+(?:\[.\]\s+)?)?/;

const at = (line: number, ch: number): EditorPosition => ({ line, ch });

function textSpan(line: string) {
  const start = MARKER.exec(line)?.[0].length ?? 0;
  const text = line.slice(start).trimEnd();
  return { start, end: start + text.length };
}

function lineText(editor: Editor, line: number): EditorRange {
  const span = textSpan(editor.getLine(line));
  return { from: at(line, span.start), to: at(line, span.end) };
}

function selected(editor: Editor): EditorRange {
  const from = editor.getCursor("from");
  const to = editor.getCursor("to");
  const wraps = to.ch === 0 && to.line > from.line;
  const last = to.line - 1;
  const end = wraps ? at(last, editor.getLine(last).length) : to;
  return { from, to: end };
}

const covers = (range: EditorRange, text: EditorRange) =>
  range.from.line === range.to.line && range.from.ch <= text.from.ch && range.to.ch >= text.to.ch;

function trimmed(editor: Editor, range: EditorRange): EditorRange {
  const text = editor.getRange(range.from, range.to);
  const lead = text.length - text.trimStart().length;
  const start = editor.posToOffset(range.from) + lead;
  const end = start + text.trim().length;
  return { from: editor.offsetToPos(start), to: editor.offsetToPos(end) };
}

export function selectionRange(editor: Editor): EditorRange {
  if (editor.somethingSelected()) {
    return { from: editor.getCursor("from"), to: editor.getCursor("to") };
  }
  const { line } = editor.getCursor();
  return { from: at(line, 0), to: at(line, editor.getLine(line).length) };
}

export function anchorRange(editor: Editor): EditorRange {
  if (!editor.somethingSelected()) {
    return lineText(editor, editor.getCursor().line);
  }
  const range = selected(editor);
  const own = lineText(editor, range.from.line);
  return covers(range, own) ? own : trimmed(editor, range);
}

export function cursorRange(editor: Editor): EditorRange {
  const cursor = editor.getCursor();
  return { from: cursor, to: cursor };
}
