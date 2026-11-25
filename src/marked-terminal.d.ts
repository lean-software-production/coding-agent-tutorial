// marked-terminal ships no types, and @types/marked-terminal is still on v6:
// it bundles an older copy of marked's types that collides with ours.
declare module "marked-terminal" {
  import type { MarkedExtension } from "marked";
  export function markedTerminal(): MarkedExtension;
}
