import assert from "node:assert/strict";
import { test } from "node:test";

import { runAgent } from "./support/agent.ts";
import { calls, says, tool } from "./support/model-script.ts";

test("010 puts one system message at the front of every request", async (t) => {
  const agent = await runAgent(t, {
    files: { "notes.txt": "buy milk" },
    replies: [calls(tool("read_file", { path: "notes.txt" })), says("Milk."), says("Still milk.")],
    prompts: ["What do I need?", "Are you sure?"],
  });

  assert.equal(agent.requests.length, 3);
  for (const { messages } of agent.requests) {
    assert.equal(messages[0]?.role, "system");
    assert.ok(messages[0].content);
    assert.equal(messages.filter((message) => message.role === "system").length, 1);
  }
});
