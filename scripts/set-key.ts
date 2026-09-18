// Prompts for your OpenRouter API key and writes it into .env. Called by ./setup
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import chalk from "chalk";

console.log();
console.log(chalk.dim("  Need a key? Create one at ") + chalk.cyan.underline("https://openrouter.ai/keys"));
console.log();

const rl = createInterface({ input: stdin, output: stdout });
const key = (await rl.question(chalk.bold("  Paste your OpenRouter API key: "))).trim();
rl.close();

if (!key) {
  console.log(chalk.red("\n  ✗ No key entered. Nothing written.\n"));
  process.exit(1);
}

// Start from the existing .env so we keep any model or URL you've customised.
const source = existsSync(".env") ? ".env" : ".env.example";
const env = readFileSync(source, "utf8").replace(/^OPENROUTER_API_KEY=.*$/m, `OPENROUTER_API_KEY=${key}`);
writeFileSync(".env", env);

console.log();
console.log(chalk.green("  ✔ Saved ") + chalk.bold("OPENROUTER_API_KEY") + chalk.dim(` (…${key.slice(-4)}) to `) + chalk.bold(".env"));
console.log();
