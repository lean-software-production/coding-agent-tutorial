import assert from "node:assert/strict";
import { test } from "node:test";

import { runAgent } from "./support/agent.ts";
import { canCallTools, resultOf } from "./support/fake-model.ts";
import { calls, says, tool } from "./support/model-script.ts";

const MAX_ROUNDS = 25;

test("007 keeps running tools until the model answers", async (t) => {
  const readFirst = tool("read_file", { path: "first.txt" });
  const readSecond = tool("read_file", { path: "second.txt" });
  const agent = await runAgent(t, {
    files: { "first.txt": "look in second.txt", "second.txt": "treasure" },
    replies: [calls(readFirst), calls(readSecond), says("Found treasure.")],
    prompts: ["Follow the trail."],
  });

  assert.match(agent.output, /Tool: read_file\(first\.txt\)\s+Tool: read_file\(second\.txt\)\s+Assistant:\s+Found treasure\./);
  assert.equal(resultOf(readSecond, agent.requests[2]), "treasure");
});

test("007 asks for a final answer without tools after 25 rounds", async (t) => {
  const rounds = Array.from({ length: MAX_ROUNDS }, () => calls(tool("read_file", { path: "first.txt" })));
  const agent = await runAgent(t, {
    files: { "first.txt": "keep looking" },
    replies: [...rounds, says("I ran out of rounds.")],
    prompts: ["Never stop looking."],
  });

  assert.match(agent.output, /Assistant:\s+I ran out of rounds\./);
  assert.ok(canCallTools(agent.requests[MAX_ROUNDS - 1]));
  assert.ok(!canCallTools(agent.requests[MAX_ROUNDS]));
});
