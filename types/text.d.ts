// esbuild bundles a .txt import as its text (--loader:.txt=text).
declare module "*.txt" {
  const text: string;
  export default text;
}
