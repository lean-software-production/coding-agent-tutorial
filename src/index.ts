import OpenAI from "openai";
import * as readline from "node:readline/promises";
import { marked } from "marked";
import { markedTerminal } from "marked-terminal";
import chalk from "chalk";

marked.use(markedTerminal());

const apiKey = process.env.OPENCODE_API_KEY;
if (!apiKey) {
  console.error("OPENCODE_API_KEY is not set. See the README for how to get one.");
  process.exit(1);
}

const client = new OpenAI({
  apiKey,
  baseURL: process.env.OPENCODE_BASE_URL ?? "https://opencode.ai/zen/v1",
});

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.on("SIGINT", () => {
  console.log();
  process.exit(0);
});

const messages: OpenAI.ChatCompletionMessageParam[] = [];

while (true) {
  const prompt = await rl.question(chalk.green("You: "));
  messages.push({ role: "user", content: prompt });

  const response = await client.chat.completions.create({
    model: process.env.OPENCODE_MODEL ?? "deepseek-v4-flash",
    messages,
  });

  const reply = response.choices[0].message;
  messages.push(reply);

  console.log(chalk.blue("Assistant:"));
  console.log(await marked.parse(reply.content ?? ""));
  console.log(chalk.dim("─".repeat(40)));
}
