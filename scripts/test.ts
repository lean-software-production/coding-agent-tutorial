// Runs the acceptance tests up to the iteration you are on, or up to 004 with `npm test -- 004`.
import { spawnSync } from "node:child_process";
import { globSync, readFileSync } from "node:fs";
import path from "node:path";

const ledger = readFileSync("docs/iterations/README.md", "utf8");
const started = [...ledger.matchAll(/^\| (\d{3}) .*\| (?:WIP|Done) \|$/gm)].map((row) => row[1]);
const last = process.argv[2]?.padStart(3, "0") ?? started.at(-1) ?? "001";
const tests = globSync("test/iterations/*.test.ts").filter((file) => path.basename(file).slice(0, 3) <= last);

process.exit(spawnSync(process.execPath, ["--test", ...tests.sort()], { stdio: "inherit" }).status ?? 1);
