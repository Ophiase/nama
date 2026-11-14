import type { Editor, EditorRange } from "obsidian";

function rangeOf(editor: Editor): EditorRange {
  if (editor.somethingSelected()) {
    return { from: editor.getCursor("from"), to: editor.getCursor("to") };
  }
  const { line } = editor.getCursor();
  return { from: { line, ch: 0 }, to: { line, ch: editor.getLine(line).length } };
}

/** The selection, or the current line when nothing is selected, as it read when taken. */
export class Selection {
  readonly editor: Editor;
  readonly range: EditorRange;
  readonly text: string;

  constructor(editor: Editor) {
    this.editor = editor;
    this.range = rangeOf(editor);
    this.text = this.current();
  }

  private current() {
    return this.editor.getRange(this.range.from, this.range.to);
  }

  get stale() {
    return this.current() !== this.text;
  }

  replace(text: string) {
    this.editor.replaceRange(text, this.range.from, this.range.to);
  }
}
