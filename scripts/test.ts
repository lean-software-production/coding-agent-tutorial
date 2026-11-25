// Runs the acceptance tests: all of them, or up to one iteration with `npm test -- 004`.
import { spawnSync } from "node:child_process";
import { globSync } from "node:fs";
import path from "node:path";

const last = (process.argv[2] ?? "999").padStart(3, "0");
const tests = globSync("test/iterations/*.test.ts").filter((file) => path.basename(file).slice(0, 3) <= last);

process.exit(spawnSync(process.execPath, ["--test", ...tests.sort()], { stdio: "inherit" }).status ?? 1);
