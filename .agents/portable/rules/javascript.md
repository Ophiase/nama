# JavaScript

How JavaScript code in this repository is expected to look. The same taste as
[python.md](python.md) and [rust.md](rust.md), in JavaScript's own tools;
comments follow [comments.md](comments.md).

## Lints carry the rules

Policy lives once, in [javascript.json](../biome/javascript.json), and the
project's `biome.json` only extends it and says which files it covers:

```json
{ "extends": ["./.agents/portable/biome/javascript.json"] }
```

- A function fits in twelve lines, takes three parameters at most, and nests
  one callback and two blocks at most. Statements are not counted: a named
  intermediate value is never the thing to save.
- No nested ternary, no template literal inside another, no
  `forEach`, no reassigned parameter, no shadowed name, braces on every `if`.
- [short-names.sh](../checks/short-names.sh) is the `min_ident_chars` Biome
  lacks: no single-letter names, not even `i`, `u` or `m`.

A lint is silenced with `// biome-ignore <rule>: <reason>`, never by editing
the shared config: the reason is the review.

## A callback is a name

The failure these rules exist for is the chain that grows inward: a builder
whose callback calls a builder whose callback calls a third. Each level is a
concern without a name.

```js
new Setting(element)
  .addTextArea((area) => this.patternsArea(area))
  .addExtraButton((button) => this.resetButton(button));
```

A callback is one line that calls a named function or method. When it needs a
body, the body is a method of the class or a function of the module.

## Abstractions, not steps

- A function reads as one sentence at one level. Reading a range, extracting
  the URLs, writing the clipboard and telling the user are four concerns; the
  function that does all four calls four names.
- A value read from the outside world and the operations on it are a class:
  the selection, its text when it was taken, whether it went stale, how to
  replace it.
- A message is built by a function (`count(urls, "URL")`), never assembled
  inline from ternaries and template fragments.
- Data is a file, not a constant: a list a user may edit (patterns, defaults)
  lives in a `.txt` or `.json` beside the code and is bundled as text.
- `return notify(...)` to leave early is a trick, not a contract: notify,
  then `return`.

## One step per line

A step that produces a value gets a `const` with a short name, and the next
line uses that name. A call is never the argument of another call when its
result means something, and a chain stops where its result gets a name. The
bundler erases the names; the reader keeps them.

```js
const selection = new Selection(editor);
const found = urlsIn(selection.text);
const urls = found.slice(0, limit);
```

## Shape of the code

- One concept per module; a module exports its door and keeps its helpers.
- Pure functions first, then the class that touches the host API.
- JSDoc is for a signature a reader cannot decode on its own, not a summary.
- No runtime dependency the host does not provide without a measured need.
