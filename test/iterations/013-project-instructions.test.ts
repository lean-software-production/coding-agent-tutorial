import assert from "node:assert/strict";
import { test } from "node:test";

import { runAgent } from "./support/agent.ts";
import { says } from "./support/model-script.ts";

test("013 adds the workspace's AGENTS.md to the one system message", async (t) => {
  const agent = await runAgent(t, {
    files: { "AGENTS.md": "Rules from the agent's home." },
    workspace: { "AGENTS.md": "End every reply with Ahoy." },
    replies: [says("Paris. Ahoy")],
    prompts: ["What is the capital of France?"],
  });

  const system = agent.requests[0]?.messages.filter((message) => message.role === "system") ?? [];
  assert.equal(system.length, 1);
  assert.match(String(system[0].content), /\w[\s\S]*End every reply with Ahoy\./);
  assert.doesNotMatch(String(system[0].content), /Rules from the agent's home/);
});
