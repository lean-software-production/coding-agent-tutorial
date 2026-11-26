import chalk from "chalk";
import { input } from "@inquirer/prompts";
import { OpenRouter } from "@openrouter/sdk";
import type { ChatMessages } from "@openrouter/sdk/models";
import { marked } from "marked";
import { markedTerminal } from "marked-terminal";

marked.use(markedTerminal());

const client = new OpenRouter();
const model = process.env.OPENROUTER_MODEL ?? "openai/gpt-6-luna"

const messages: ChatMessages[] = [];

while (true) {
  const userMessage = await input({ message: chalk.cyan("You:") }).catch(() => process.exit());
  messages.push({ role: "user", content: userMessage });

  const response = await client.chat.send({ chatRequest: { model, messages } });
  const reply = String(response.choices[0].message.content);
  messages.push({ role: "assistant", content: reply });

  console.log(chalk.green("Assistant:"));
  console.log(await marked.parse(reply));
  console.log(chalk.dim("─".repeat(40)));
}
