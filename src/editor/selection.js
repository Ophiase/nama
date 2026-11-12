function rangeOf(editor) {
  if (editor.somethingSelected()) {
    return { from: editor.getCursor("from"), to: editor.getCursor("to") };
  }
  const { line } = editor.getCursor();
  return { from: { line, ch: 0 }, to: { line, ch: editor.getLine(line).length } };
}

/** The selection, or the current line when nothing is selected, as it read when taken. */
export class Selection {
  constructor(editor) {
    this.editor = editor;
    this.range = rangeOf(editor);
    this.text = this.current();
  }

  current() {
    return this.editor.getRange(this.range.from, this.range.to);
  }

  get stale() {
    return this.current() !== this.text;
  }

  replace(text) {
    this.editor.replaceRange(text, this.range.from, this.range.to);
  }
}
