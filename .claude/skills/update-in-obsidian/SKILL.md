---
name: update-in-obsidian
description: Build Nama and install it into the user's Obsidian vault, finding the vault when `.env` does not name it. Use when the user asks to install, reinstall or update the plugin in their vault, or to try a change in Obsidian.
---

# Update in Obsidian

`just install` builds the bundle and copies it into `$NAMA_VAULT`, read from
`.env`. This skill makes sure `.env` names the right vault, then runs it.

## 1. Find the vault

Stop at the first source that names one vault.

1. `NAMA_VAULT` in `.env`, if that folder still holds a `.obsidian`.
2. Your memory: a vault path recorded for this machine.
3. A vault where Nama is already installed: a folder holding
   `.obsidian/plugins/nama/manifest.json`. Search the vaults Obsidian
   knows first, then the home folder.
4. The vaults Obsidian knows, the `path` of each entry under `vaults` in
   its `obsidian.json`:

   | Install | `obsidian.json` |
   | --- | --- |
   | Linux | `~/.config/obsidian/` |
   | Linux, Flatpak | `~/.var/app/md.obsidian.Obsidian/config/obsidian/` |
   | Linux, Snap | `~/snap/obsidian/current/.config/obsidian/` |
   | macOS | `~/Library/Application Support/obsidian/` |
   | Windows | `%APPDATA%\obsidian\` |

   The entry with `"open": true` is the vault in use.

Several candidates and nothing to choose between them: ask the user, listing
them. None: ask for the path.

## 2. Record it

- Write `NAMA_VAULT=<absolute path>` into `.env`, after checking that
  `git check-ignore .env` succeeds. Keep the other lines of `.env`.
- Save the path in your memory, with the machine's host name, so the next
  session on a machine without `.env` finds it at step 2.

The path never goes into a tracked file or a commit.

## 3. Install

- `node_modules` missing: `just setup` first.
- `just install`. It refuses a folder without `.obsidian`; then go back to
  step 1 rather than creating one.
- `data.json` in the plugin folder holds the user's settings: `just install`
  leaves it alone, and so do you.

## 4. Tell the user

Say which vault was updated. Obsidian keeps the old bundle in memory until
Nama is turned off and on again in the community plugins, or the app is
reloaded: say so, every time.
