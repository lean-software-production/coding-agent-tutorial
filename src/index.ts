import { readFile } from "node:fs/promises";
import path from "node:path";
import chalk from "chalk";
import { input } from "@inquirer/prompts";
import { OpenRouter } from "@openrouter/sdk";
import type { ChatFunctionToolFunction, ChatMessages } from "@openrouter/sdk/models";
import { marked } from "marked";
import { markedTerminal } from "marked-terminal";

marked.use(markedTerminal());

const client = new OpenRouter();
const model = process.env.OPENROUTER_MODEL ?? "openai/gpt-6-luna"

const tools: ChatFunctionToolFunction[] = [
  {
    type: "function",
    function: {
      name: "read_file",
      description: "Read a text file in this project.",
      parameters: {
        type: "object",
        properties: { path: { type: "string", description: "Path relative to the project root" } },
        required: ["path"],
      },
    },
  },
];

const messages: ChatMessages[] = [];

while (true) {
  const userMessage = await input({ message: chalk.cyan("You:") }).catch(() => process.exit());
  messages.push({ role: "user", content: userMessage });

  let reply = await askModel();
  const call = reply.toolCalls?.[0];
  if (call) {
    const args = JSON.parse(call.function.arguments);
    console.log(chalk.yellow(`Tool: read_file(${args.path})`));
    messages.push({ ...reply, toolCalls: [call] });
    messages.push({ role: "tool", toolCallId: call.id, content: await readProjectFile(args.path).catch(String) });
    reply = await askModel();
  }

  const answer = String(reply.content || "The model replied with nothing. It may want another tool, but gets one per prompt.");
  messages.push({ role: "assistant", content: answer });

  console.log(chalk.green("Assistant:"));
  console.log(await marked.parse(answer));
  console.log(chalk.dim("─".repeat(40)));
}

async function askModel() {
  const response = await client.chat.send({ chatRequest: { model, messages, tools } });
  return response.choices[0].message;
}

async function readProjectFile(relativePath: string) {
  const file = path.resolve(relativePath);
  if (!file.startsWith(process.cwd() + path.sep)) throw new Error(`${relativePath} is outside this project.`);

  return readFile(file, "utf8");
}
