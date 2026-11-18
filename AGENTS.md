# AGENTS.md

Instructions for any coding agent in this repository. Claude Code reads them
through `.claude/CLAUDE.md`.

## What this project is

Nama, an Obsidian plugin: name the bare URLs of a selection with their page
title, strip the noise from those titles, copy the URLs out of a selection.

## Language

English everywhere: code, comments, markdown, commits. The author may write to
you in French; answer in French, write files in English.

## The canon

Rules first, code second. The canon is
[.agents/kanon.md](.agents/kanon.md); the `<>` in the README is its sign.

## Layout

| Path | What it holds |
| --- | --- |
| `src/main.ts` | the plugin: commands and the editor menu |
| `src/actions/` | what each command does, one file per command |
| `src/editor/` | the region of the editor a command works on, and vim |
| `src/urls.ts` | finding URLs, their form and their spans in a text |
| `src/markdown.ts` | writing links and applying edits to a text |
| `src/title/` | fetching a page title, and the patterns that clean it |
| `src/title/strip-patterns.txt` | the default strip patterns, one regex per line |
| `src/settings.ts` | the saved settings and the settings tab |
| `types/` | declarations for what TypeScript cannot see: `.txt` imports |
| `dist/main.js` | the bundle, built, never edited, gitignored |

## The harness

TypeScript follows
[.agents/portable/rules/javascript.md](.agents/portable/rules/javascript.md)
and [.agents/portable/rules/typescript.md](.agents/portable/rules/typescript.md);
`biome.json` extends the shared config and `tsconfig.json` is strict, and
neither is loosened locally. A type the Obsidian API lacks is declared, as in
`src/editor/vim.ts`.

- `just agent gate` is the one command to declare work done: `just check`,
  then `just guards`.
- `just fmt` fixes the formatting; `just build` bundles; `just install`
  copies the bundle into `$NAMA_VAULT`, which comes from `.env`.
- A change to the plugin that passes the gate is installed right away, so the
  author can try it: the `update-in-obsidian` skill finds the vault when `.env`
  does not name it.
- `just install-hooks` once: every commit runs `just guards`.

## Never

- A local path, a vault name or a machine name in a tracked file or a commit:
  they belong in `.env`, which is gitignored.
- A runtime dependency: `obsidian` is provided by the app.
- A network call the plugin does not need to name a link.
- Commit or push without being asked.
