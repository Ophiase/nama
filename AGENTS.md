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
| `src/actions.ts` | what each command does |
| `src/editor/selection.ts` | the text a command works on |
| `src/editor/anchor.ts` | the text a link is wrapped around |
| `src/editor/vim.ts` | the vim mode, which the Obsidian API does not expose |
| `src/urls.ts` | finding URLs and their spans in a text |
| `src/title.ts` | fetching, decoding and cleaning a page title |
| `src/settings.ts` | the defaults and the settings tab |
| `src/strip-patterns.txt` | the default strip patterns, one regex per line |
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
  copies the bundle into `$NAMA_VAULT`, which comes from `.env` and is run by
  the author.
- `just install-hooks` once: every commit runs `just guards`.

## Never

- A local path, a vault name or a machine name in a tracked file or a commit:
  they belong in `.env`, which is gitignored.
- A runtime dependency: `obsidian` is provided by the app.
- A network call the plugin does not need to name a link.
- Commit or push without being asked.
