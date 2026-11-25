import assert from "node:assert/strict";
import { test } from "node:test";

import { runAgent } from "./support/agent.ts";
import { resultOf, toolNamesIn } from "./support/fake-model.ts";
import { calls, says, tool } from "./support/model-script.ts";

test("015 hands a task to a subagent and keeps only its answer", async (t) => {
  const delegate = tool("subagent", { task: "Find the treasure." });
  const agent = await runAgent(t, {
    files: { "map.txt": "three paces north of the oak" },
    replies: [
      calls(delegate),
      calls(tool("read_file", { path: "map.txt" })),
      says("Near the oak."),
      says("Dig near the oak."),
    ],
    prompts: ["Plan my weekend."],
  });

  const [main, subagent, , mainAgain] = agent.requests;
  assert.ok(toolNamesIn(main).includes("subagent"));
  assert.match(agent.output, /Tool: subagent\(Find the treasure\.\)\s+Tool: read_file\(map\.txt\)/);
  assert.match(agent.output, /Assistant:\s+Dig near the oak\./);

  assert.deepEqual(subagent?.messages.map((message) => message.role), ["system", "user"]);
  assert.equal(subagent?.messages[1]?.content, "Find the treasure.");
  assert.ok(toolNamesIn(subagent).includes("read_file"));
  assert.ok(!toolNamesIn(subagent).includes("subagent"));

  assert.equal(resultOf(delegate, mainAgain), "Near the oak.");
  assert.doesNotMatch(JSON.stringify(mainAgain?.messages), /three paces/);
});

test("015 gives each subagent a conversation of its own", async (t) => {
  const first = tool("subagent", { task: "Read the first half." });
  const second = tool("subagent", { task: "Read the second half." });
  const agent = await runAgent(t, {
    replies: [calls(first), says("First."), calls(second), says("Second."), says("Both read.")],
    prompts: ["Read it all."],
  });

  assert.match(agent.output, /Assistant:\s+Both read\./);
  assert.doesNotMatch(JSON.stringify(agent.requests[3]?.messages), /first half/);
  assert.equal(resultOf(first, agent.requests[4]), "First.");
  assert.equal(resultOf(second, agent.requests[4]), "Second.");
});
