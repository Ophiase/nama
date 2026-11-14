// The Obsidian API knows nothing of vim: its state lives on the CodeMirror 5 adapter of the keymap.
import type { Editor } from "obsidian";

interface VimState {
  visualMode?: boolean;
  insertMode?: boolean;
}

interface CodeMirror5 {
  state?: { vim?: VimState };
}

interface VimApi {
  handleKey(cm: CodeMirror5, key: string): void;
}

interface VimHost {
  cm?: { cm?: CodeMirror5 };
}

declare global {
  interface Window {
    CodeMirrorAdapter?: { Vim?: VimApi };
  }
}

function vimOf(editor: Editor) {
  const cm = (editor as Editor & VimHost).cm?.cm;
  const api = window.CodeMirrorAdapter?.Vim;
  const state = cm?.state?.vim;
  return cm && api && state ? { cm, api, state } : null;
}

export function leaveVisual(editor: Editor) {
  const vim = vimOf(editor);
  if (vim?.state.visualMode) {
    vim.api.handleKey(vim.cm, "<Esc>");
  }
}

export function enterInsert(editor: Editor) {
  const vim = vimOf(editor);
  if (vim && !vim.state.insertMode) {
    vim.api.handleKey(vim.cm, "i");
  }
}
