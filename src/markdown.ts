import type { UrlSpan } from "./urls";

/** What a span of a text is replaced by. */
export interface Edit {
  readonly span: UrlSpan;
  readonly written: string;
}

export const link = (name: string, url: string) => `[${name}](${url})`;

export const embed = (name: string, url: string) => `!${link(name, url)}`;

/** The offset of the `(` in `link(name, url)`. */
export const parenOf = (name: string) => name.length + 2;

/** `text` made safe as the name of a link. */
export const escaped = (text: string) => text.replace(/[[\]]/g, "\\$&");

const splice = (text: string, { span, written }: Edit) =>
  `${text.slice(0, span.start)}${written}${text.slice(span.end)}`;

/** `text` with every edit applied, the edits in the order of their spans. */
export const rewrite = (text: string, edits: readonly Edit[]) => edits.reduceRight(splice, text);
