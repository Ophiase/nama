# Changelog

Each release of Nama, newest first. `just release` refuses a version without
its section here, and the GitHub release takes its notes from it.

## 0.1.0

- Name URLs: every bare URL of the selection becomes `[title](url)`, the
  title cleaned by the strip patterns of the settings.
- Insert URL: the selection, or the text of the line, becomes a link to the
  clipboard's URL.
- Enrich URLs: every URL of the selection becomes `![name](url)`, or the
  clipboard's URL is embedded at the cursor.
- Copy first URL, Copy all URLs.
