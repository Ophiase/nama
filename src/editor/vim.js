// The Obsidian API knows nothing of vim: its state lives on the CodeMirror 5 adapter of the keymap.
function vimOf(editor) {
  const cm = editor.cm?.cm;
  const api = window.CodeMirrorAdapter?.Vim;
  const state = cm?.state?.vim;
  return api && state ? { cm, api, state } : null;
}

export function leaveVisual(editor) {
  const vim = vimOf(editor);
  if (vim?.state.visualMode) {
    vim.api.handleKey(vim.cm, "<Esc>");
  }
}

export function enterInsert(editor) {
  const vim = vimOf(editor);
  if (vim && !vim.state.insertMode) {
    vim.api.handleKey(vim.cm, "i");
  }
}
