import { appendFile, readFile } from "node:fs/promises";
import path from "node:path";
import chalk from "chalk";
import { input } from "@inquirer/prompts";
import { OpenRouter } from "@openrouter/sdk";
import type { ChatAssistantMessage, ChatFunctionToolFunction, ChatMessages, ChatToolCall } from "@openrouter/sdk/models";
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
  if (reply.toolCalls?.length) {
    messages.push(reply);
    for (const call of reply.toolCalls) {
      const args = JSON.parse(call.function.arguments);
      console.log(chalk.yellow(`Tool: read_file(${args.path})`));
      const result = await readProjectFile(args.path).catch(String);
      await log(`[tool] ${describe(call)}: ${result.length} chars`);
      messages.push({ role: "tool", toolCallId: call.id, content: result });
    }
    reply = await askModel();
  }

  const answer = String(reply.content || "The model replied with nothing. It may want another tool, but gets one batch per prompt.");
  messages.push({ role: "assistant", content: answer });

  console.log(chalk.green("Assistant:"));
  console.log(await marked.parse(answer));
  console.log(chalk.dim("─".repeat(40)));
}

async function askModel() {
  await log(`[llm] request: ${messages.length} messages, tools: ${tools.map((tool) => tool.function.name).join(", ")}`);
  const response = await client.chat.send({ chatRequest: { model, messages, tools } }).catch(logFailure);
  const reply = response.choices[0].message;
  await log(`[llm] response: ${summarize(reply)}, ${response.usage?.promptTokens} prompt tokens`);

  return reply;
}

async function logFailure(error: Error): Promise<never> {
  await log(`[llm] failed: ${error.message}`);
  throw error;
}

function summarize(reply: ChatAssistantMessage) {
  if (reply.toolCalls?.length) return `tool_calls: ${reply.toolCalls.map(describe).join(", ")}`;
  if (reply.content) return `assistant text: ${reply.content.length} chars`;

  return "empty";
}

function describe(call: ChatToolCall) {
  return `${call.function.name}(${Object.values(JSON.parse(call.function.arguments)).join(", ")})`;
}

function log(entry: string) {
  return appendFile("agent.log", `${new Date().toISOString()} ${entry}\n`);
}

async function readProjectFile(relativePath: string) {
  const file = path.resolve(relativePath);
  if (!file.startsWith(process.cwd() + path.sep)) throw new Error(`${relativePath} is outside this project.`);

  return readFile(file, "utf8");
}
