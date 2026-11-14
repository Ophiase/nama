import type { Editor, EditorRange } from "obsidian";
import { anchorRange, cursorRange, selectionRange } from "./ranges";

/** A range of the editor, and its text as it read when taken. */
export class Region {
  readonly text: string;

  private constructor(
    private readonly editor: Editor,
    private readonly range: EditorRange,
  ) {
    this.text = this.current();
  }

  /** The selection, or the current line when nothing is selected. */
  static selection(editor: Editor) {
    return new Region(editor, selectionRange(editor));
  }

  /** The selection, or the text of its line past any marker when it holds all of it or nothing. */
  static anchor(editor: Editor) {
    return new Region(editor, anchorRange(editor));
  }

  /** The empty range at the cursor, where a text is inserted. */
  static cursor(editor: Editor) {
    return new Region(editor, cursorRange(editor));
  }

  get stale() {
    return this.current() !== this.text;
  }

  replace(text: string) {
    this.editor.replaceRange(text, this.range.from, this.range.to);
  }

  /** Puts the cursor `offset` characters past the start of the region, and focuses the editor. */
  moveCursor(offset: number) {
    const start = this.editor.posToOffset(this.range.from);
    const cursor = this.editor.offsetToPos(start + offset);
    this.editor.setCursor(cursor);
    this.editor.focus();
  }

  private current() {
    return this.editor.getRange(this.range.from, this.range.to);
  }
}
