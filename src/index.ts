import { spawnSync } from "node:child_process";
import { appendFile, readFile, writeFile } from "node:fs/promises";
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

const LOG_FILE = path.join(import.meta.dirname, "..", "agent.log");
const MAX_ROUNDS = 25;
const MAX_OUTPUT = 8000;
const MAX_SECONDS = 30;

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
  {
    type: "function",
    function: {
      name: "edit_file",
      description: "Replace text in a file in this project. Read the file first.",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "Path relative to the project root" },
          old_text: { type: "string", description: "Exact text to replace, found once in the file" },
          new_text: { type: "string", description: "Text to put in its place" },
        },
        required: ["path", "old_text", "new_text"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "bash",
      description: "Run a command from the project root.",
      parameters: {
        type: "object",
        properties: { command: { type: "string", description: "Command to run with bash -c" } },
        required: ["command"],
      },
    },
  },
];

const SYSTEM_PROMPT = `Read a file before you change it.
After you change anything, run the check and read what it printed.
A failing check is the only thing you work on until it passes.
Never say a job is done unless a command you ran says so.`;

const messages: ChatMessages[] = [{ role: "system", content: SYSTEM_PROMPT }];

while (true) {
  const userMessage = await input({ message: chalk.cyan("You:") }).catch(() => process.exit());
  messages.push({ role: "user", content: userMessage });

  let reply = await askModel();
  for (let round = 1; reply.toolCalls?.length && round <= MAX_ROUNDS; round++) {
    messages.push(reply);
    for (const call of reply.toolCalls) {
      console.log(chalk.yellow(`Tool: ${describe(call)}`));
      const result = await runTool(call).catch(String);
      await log(`[tool] ${describe(call)}: ${result.length} chars`);
      messages.push({ role: "tool", toolCallId: call.id, content: result });
    }
    reply = await askModel(round < MAX_ROUNDS ? "auto" : "none");
  }

  const answer = String(reply.content || "The model replied with nothing.");
  messages.push({ role: "assistant", content: answer });

  console.log(chalk.green("Assistant:"));
  console.log(await marked.parse(answer));
  console.log(chalk.dim("─".repeat(40)));
}

async function askModel(toolChoice: "auto" | "none" = "auto") {
  await log(`[llm] request: ${messages.length} messages, tools: ${tools.map((tool) => tool.function.name).join(", ")}`);
  const response = await client.chat.send({ chatRequest: { model, messages, tools, toolChoice } }).catch(logFailure);
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
  return appendFile(LOG_FILE, `${new Date().toISOString()} ${entry}\n`);
}

async function runTool(call: ChatToolCall): Promise<string> {
  const args = JSON.parse(call.function.arguments);
  switch (call.function.name) {
    case "read_file":
      return readProjectFile(args.path);
    case "edit_file":
      return editProjectFile(args.path, args.old_text, args.new_text);
    case "bash":
      return runCommand(args.command);
    default:
      throw new Error(`there is no tool called ${call.function.name}.`);
  }
}

async function readProjectFile(relativePath: string) {
  return readFile(insideProject(relativePath), "utf8");
}

async function editProjectFile(relativePath: string, oldText: string, newText: string) {
  const file = insideProject(relativePath);
  const around = (await readFile(file, "utf8")).split(oldText);
  if (around.length !== 2) throw new Error(`old_text was found ${around.length - 1} times, and must be found once.`);

  await writeFile(file, around.join(newText));
  return `Edited ${relativePath}.`;
}

function runCommand(command: string) {
  const { stdout, stderr, status } = spawnSync("bash", ["-c", command], {
    encoding: "utf8",
    timeout: MAX_SECONDS * 1000,
    maxBuffer: Infinity,
  });
  const output = stdout + stderr;
  const shown = output.length > MAX_OUTPUT ? `${output.slice(0, MAX_OUTPUT)}\n(cut off)` : output;
  const ending = status === null ? `Killed after ${MAX_SECONDS} seconds.` : `Exit code: ${status}`;

  return `${shown}\n${ending}`;
}

function insideProject(relativePath: string) {
  const file = path.resolve(relativePath);
  if (!file.startsWith(process.cwd() + path.sep)) throw new Error(`${relativePath} is outside this project.`);

  return file;
}
