import chalk from "chalk";
import { input } from "@inquirer/prompts";
import { OpenRouter } from "@openrouter/sdk";

const client = new OpenRouter();
const model = process.env.OPENROUTER_MODEL ?? "openai/gpt-5.6-luna"

const userMessage = await input({ message: chalk.cyan("You:") });

const response = `TODO: call the model's API and respond to ${ userMessage }`;

console.log(chalk.green(`Assistant: ${response}`));
