import { Notice } from "obsidian";

export const say = (message: string) => new Notice(`Nama: ${message}`);

export function count(items: readonly unknown[], noun: string) {
  const plural = items.length === 1 ? "" : "s";
  return `${items.length} ${noun}${plural}`;
}
