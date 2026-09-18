// Prompts for your OpenRouter API key, checks it works, and writes it into .env.
// Called by ./setup
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import chalk from "chalk";

console.log();
console.log(chalk.dim("  Need a key? Create one at ") + chalk.cyan.underline("https://openrouter.ai/keys"));
console.log();

const key = (await promptHidden(chalk.bold("  Paste your OpenRouter API key: "))).trim();

if (!key) {
  console.log(chalk.red("\n  ✗ No key entered. Nothing written.\n"));
  process.exit(1);
}

console.log(chalk.dim("\n  Checking key with OpenRouter..."));

const check = await checkKey(key);
if (!check.ok) {
  console.log(chalk.red(`  ✗ ${check.message}`) + chalk.dim(" Nothing written.\n"));
  process.exit(1);
}

// Start from the existing .env so we keep any model or URL you've customised.
const source = existsSync(".env") ? ".env" : ".env.example";
const env = readFileSync(source, "utf8").replace(/^OPENROUTER_API_KEY=.*$/m, `OPENROUTER_API_KEY=${key}`);
writeFileSync(".env", env);

console.log(chalk.green("  ✔ Key verified") + chalk.dim(check.credit ? ` — ${check.credit} credit remaining` : ""));
console.log(chalk.green("  ✔ Saved ") + chalk.bold("OPENROUTER_API_KEY") + chalk.dim(` (…${key.slice(-4)}) to `) + chalk.bold(".env"));
console.log();

// Reads the key without echoing it to the screen, showing * per character instead.
// Falls back to a plain (visible) prompt when stdin isn't a terminal, e.g. piped input in tests.
async function promptHidden(promptText: string): Promise<string> {
  if (!stdin.isTTY) {
    const rl = createInterface({ input: stdin, output: stdout });
    const answer = await rl.question(promptText);
    rl.close();
    return answer;
  }

  return new Promise((resolve) => {
    stdout.write(promptText);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");

    let value = "";
    const onData = (chunk: string) => {
      for (const char of chunk) {
        if (char === "\n" || char === "\r" || char === "") {
          cleanup();
          stdout.write("\n");
          resolve(value);
          return;
        }
        if (char === "") {
          // Ctrl-C
          cleanup();
          stdout.write("\n");
          process.exit(1);
        }
        if (char === "" || char === "\b") {
          if (value.length > 0) {
            value = value.slice(0, -1);
            stdout.write("\b \b");
          }
          continue;
        }
        value += char;
        stdout.write("*");
      }
    };
    const cleanup = () => {
      stdin.setRawMode(false);
      stdin.pause();
      stdin.removeListener("data", onData);
    };
    stdin.on("data", onData);
  });
}

// A cheap round-trip against OpenRouter's key-info endpoint: no tokens spent,
// just confirms the key is accepted and reports the remaining credit.
async function checkKey(key: string): Promise<{ ok: true; credit: string | null } | { ok: false; message: string }> {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/key", {
      headers: { Authorization: `Bearer ${key}` },
    });
    const body = await response.json();
    if (!response.ok) {
      return { ok: false, message: body?.error?.message ?? `OpenRouter rejected the key (HTTP ${response.status}).` };
    }
    const remaining = body?.data?.limit_remaining;
    const credit = remaining == null ? null : `$${Number(remaining).toFixed(2)}`;
    return { ok: true, credit };
  } catch {
    return { ok: false, message: "Couldn't reach OpenRouter to verify the key - check your internet connection." };
  }
}
