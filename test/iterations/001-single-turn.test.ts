import assert from "node:assert/strict";
import { test } from "node:test";

import { runAgent } from "./support/agent.ts";
import { says } from "./support/model-script.ts";

test("001 answers one prompt with the model's reply", async (t) => {
  const agent = await runAgent(t, {
    replies: [says("The capital is Paris.")],
    prompts: ["What is the capital of France?"],
  });

  assert.match(agent.output, /Assistant:\s+The capital is Paris\./);
  assert.equal(agent.requests[0]?.model, "fake/model");
  assert.equal(agent.requests[0]?.messages.at(-1)?.content, "What is the capital of France?");
  assert.equal(agent.exitCode, 0);
});

test("001 renders Markdown and rules off the reply", async (t) => {
  const agent = await runAgent(t, { replies: [says("**Paris**")], prompts: ["capital of France?"] });

  assert.match(agent.output, /Paris[\s\S]*[─—-]{10,}/);
  assert.doesNotMatch(agent.output, /\*\*Paris\*\*/);
});
