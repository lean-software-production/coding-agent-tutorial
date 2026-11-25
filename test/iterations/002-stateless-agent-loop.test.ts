import assert from "node:assert/strict";
import { test } from "node:test";

import { runAgent } from "./support/agent.ts";
import { says } from "./support/model-script.ts";

test("002 keeps answering prompts until Ctrl-C, then exits cleanly", async (t) => {
  const agent = await runAgent(t, {
    replies: [says("It is Paris."), says("It is Berlin.")],
    prompts: ["What is the capital of France?", "What is the capital of Germany?"],
  });

  assert.match(agent.output, /Assistant:\s+It is Paris\.[\s\S]*Assistant:\s+It is Berlin\./);
  assert.equal(agent.exitCode, 0);
  assert.doesNotMatch(agent.output, /ExitPromptError|^\s+at .*:\d+:\d+/m);
});
