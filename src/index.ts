import chalk from "chalk";
import { input } from "@inquirer/prompts";
import { OpenRouter } from "@openrouter/sdk";
import { marked } from "marked";
import { markedTerminal } from "marked-terminal";

marked.use(markedTerminal());

const client = new OpenRouter();
const model = process.env.OPENROUTER_MODEL ?? "openai/gpt-6-luna"

const userMessage = await input({ message: chalk.cyan("You:") });

const response = await client.chat.send({
  chatRequest: { model, messages: [{ role: "user", content: userMessage }] },
});
const reply = String(response.choices[0].message.content);

console.log(chalk.green("Assistant:"));
console.log(await marked.parse(reply));
console.log(chalk.dim("─".repeat(40)));
