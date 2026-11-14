import { soleUrl } from "../urls";

/** The URL the clipboard holds, alone, or null. */
export async function clipboardUrl() {
  const text = await navigator.clipboard.readText().catch(() => "");
  return soleUrl(text);
}
