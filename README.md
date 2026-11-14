# Nama

[![Obsidian](https://img.shields.io/badge/Obsidian-plugin-483699.svg?logo=obsidian&logoColor=white)](manifest.json)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6.svg?logo=typescript&logoColor=white)](tsconfig.json)
[![just](https://img.shields.io/badge/just-recipes-EE7700.svg)](justfile)
[![Kanon](https://img.shields.io/badge/%3C%3E-Kanon-blueviolet.svg)](.agents/kanon.md)

A simple Obsidian plugin: name the URLs of a selection, strip the noise from their
titles, copy the URLs out.

## Commands

Each one acts on the selection, or on the current line when nothing is
selected; each is also in the editor's context menu.

| Command | Effect |
| --- | --- |
| Name URLs | every bare URL becomes `[title](url)` |
| Insert URL | the text becomes `[text](url)` with the clipboard's URL; without one, the cursor waits in `()`, in insert mode under vim |
| Enrich URLs | every URL not yet embedded becomes `![name](url)`, which Obsidian renders: a YouTube video, a tweet, an image; on a line without one, `![](url)` with the clipboard's URL is inserted at the cursor |
| Copy first URL | the first URL, named or bare, to the clipboard |
| Copy all URLs | every URL, one per line |

Insert URL takes the text of the line past its list, task, quote or heading
marker when the whole line is selected, or nothing is.

The strip patterns are regexes, one per line, in the settings.

## Install

```sh
cp .env.example .env    # set NAMA_VAULT
just setup
just install
```

## Make it yours

> [!TIP]
> Built for one vault and one pair of hands. Feel free to clone it and adapt
> it to your needs with your agents: the rules they follow are already in
> [AGENTS.md](AGENTS.md) ;)

## License

[Apache 2.0](LICENSE)
