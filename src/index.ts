import OpenAI from "openai";
import * as readline from "node:readline/promises";
import { marked } from "marked";
import { markedTerminal } from "marked-terminal";
import chalk from "chalk";
import * as fs from "node:fs/promises";
import { resolve, sep } from "node:path";

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

const tools: OpenAI.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "read_file",
      description: "Read a UTF-8 text file from this project.",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "Path relative to the project root" },
        },
        required: ["path"],
      },
    },
  },
];

const root = process.cwd();

const readFile = async (path: string) => {
  const full = resolve(root, path);
  if (!full.startsWith(root + sep)) {
    return `Error: ${path} is outside the project.`;
  }
  try {
    return await fs.readFile(full, "utf8");
  } catch (error) {
    return String(error);
  }
};

const messages: OpenAI.ChatCompletionMessageParam[] = [];

const ask = () =>
  client.chat.completions.create({
    model: process.env.OPENCODE_MODEL ?? "deepseek-v4-flash",
    messages,
    tools,
  });

while (true) {
  const prompt = await rl.question(chalk.green("You: "));
  messages.push({ role: "user", content: prompt });

  let reply = (await ask()).choices[0].message;
  messages.push(reply);

  const call = reply.tool_calls?.[0];
  if (call && call.type === "function") {
    const { path } = JSON.parse(call.function.arguments);
    console.log(chalk.yellow(`Tool: read_file(${path})`));

    const text = await readFile(path);
    messages.push({ role: "tool", tool_call_id: call.id, content: text });

    reply = (await ask()).choices[0].message;
    messages.push(reply);
  }

  console.log(chalk.blue("Assistant:"));
  if (reply.content) {
    console.log(await marked.parse(reply.content));
  } else if (reply.tool_calls?.length) {
    console.log(chalk.dim("(The model asked to use another tool. This version runs one tool call per prompt.)"));
  } else {
    console.log(chalk.dim("(The model returned an empty reply.)"));
  }
  console.log(chalk.dim("─".repeat(40)));
}
