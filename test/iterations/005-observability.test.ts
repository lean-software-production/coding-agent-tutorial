import assert from "node:assert/strict";
import { test } from "node:test";

import { runAgent } from "./support/agent.ts";
import { calls, fails, says, tool } from "./support/model-script.ts";

test("005 logs what the model asked for, what ran and what came back", async (t) => {
  const agent = await runAgent(t, {
    files: { "notes.txt": "buy milk" },
    replies: [calls(tool("read_file", { path: "notes.txt" })), says("Milk.")],
    prompts: ["What do I need?"],
  });
  const log = await agent.project.read("agent.log");

  assert.match(log, /^\d{4}-\d\d-\d\dT[\d:.]+Z \[llm\] request: \d+ messages, tools: .*read_file/m);
  assert.match(log, /Z \[llm\] response: tool_calls: read_file\(notes\.txt\), 1234 prompt tokens$/m);
  assert.match(log, /Z \[tool\] read_file\(notes\.txt\): 8 chars$/m);
  assert.match(log, /Z \[llm\] response: assistant text: 5 chars, 1234 prompt tokens$/m);
  assert.doesNotMatch(log, /buy milk/);
});

test("005 logs an empty reply", async (t) => {
  const agent = await runAgent(t, { replies: [says("")], prompts: ["Hello?"] });

  assert.match(await agent.project.read("agent.log"), /\[llm\] response: empty, 1234 prompt tokens$/m);
});

test("005 logs a failed model request", async (t) => {
  const agent = await runAgent(t, { replies: [fails(402, "out of credit")], prompts: ["Hello?"] });

  assert.match(await agent.project.read("agent.log"), /\[llm\] failed: .*out of credit/);
});
