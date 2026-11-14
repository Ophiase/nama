# TypeScript

What TypeScript adds to [javascript.md](javascript.md), which still holds in
full: short functions, named callbacks, one step per line. The same taste as
the typing half of [python.md](python.md), in TypeScript's own tools.

## The compiler is a lint

`tsconfig.json` is `strict`, with `noUncheckedIndexedAccess`,
`exactOptionalPropertyTypes` and `noImplicitOverride` on top, and it is never
loosened locally. `tsc` runs in the gate beside biome, which makes
`noExplicitAny` and `noNonNullAssertion` errors.

- No `any`, no `!`, no `@ts-ignore`, no `@ts-expect-error`. A value whose
  shape is unknown is `unknown` and narrowed, or it gets an interface.
- No `as` to silence the compiler. A cast is allowed in one place: where the
  host's types lack something it has, through an interface declared for that
  gap (`editor as Editor & VimHost`), never `as unknown as`.
- A type the host API lacks is declared in the file that uses it, the way
  the API would have declared it; a module the compiler cannot see (a `.txt`
  import) is declared once in `types/`.

## Types name the meaning

- A type alias is the first tool for a readable signature. When a primitive
  carries a meaning, name it: `Offset` says what `number` cannot.
  - Define each one once, in the module that owns the concept, and import it
    everywhere else. Two `Pattern` types written in two places drift apart.
  - An alias documents; it does not protect. When mixing two of them must be
    a type error, brand it: `type Offset = number & { readonly __offset: never }`.
- A set of values is a union of literals, `"name" | "copy"`, or an `as const`
  object when the values need a lookup. Not an `enum`: it emits code and
  compares by number.
- A function type with a meaning is an interface or a named alias, never an
  inline `(a: X, b: Y) => Z` repeated in two signatures.

## Immutable at the edges

- A function accepts `readonly T[]` and `Readonly<T>`: it says it will not
  touch what it is given.
- A field set once is `readonly`; a constant object or array is
  `Readonly<...>` or `as const`.
- Several values returned together are an interface with named fields, not a
  tuple: `{ paren, end }` reads, `[number, number]` does not.

## Classes and interfaces

- An `interface` for the shape of data, a `class` when the data comes with
  the operations on it, as in [javascript.md](javascript.md).
- A member that only the class uses is `private`; one that overrides the host
  says `override`.
- A value read from the outside world (saved settings, a JSON response) gets
  its interface where it is read, with every field optional when the outside
  may omit it.

## Signatures

- A declared function types every parameter; a callback takes its types from
  the call. A return type is inferred unless the function is exported and its
  result is not obvious from its body.
- `undefined` for an absent optional value, `null` only where the meaning is
  "looked for, not found", and never both for the same thing.
