import assert from "node:assert/strict";
import { test } from "node:test";

import { runAgent } from "./support/agent.ts";
import { says } from "./support/model-script.ts";

test("003 sends the earlier turns back to the model", async (t) => {
  const agent = await runAgent(t, {
    replies: [says("Nice to meet you, Matt."), says("Your name is Matt.")],
    prompts: ["My name is Matt.", "What is my name?"],
  });

  const conversation = agent.requests[1]?.messages.map(({ role, content }) => ({ role, content }));
  assert.deepEqual(conversation?.slice(-3), [
    { role: "user", content: "My name is Matt." },
    { role: "assistant", content: "Nice to meet you, Matt." },
    { role: "user", content: "What is my name?" },
  ]);
});
