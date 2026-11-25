import assert from "node:assert/strict";
import { test, type TestContext } from "node:test";

import { runAgent } from "./support/agent.ts";
import { resultOf, toolNamesIn } from "./support/fake-model.ts";
import { calls, says, tool } from "./support/model-script.ts";

async function runCommand(t: TestContext, command: string) {
  const call = tool("bash", { command });
  const agent = await runAgent(t, {
    files: { "notes.txt": "buy milk" },
    replies: [calls(call), says("Done.")],
    prompts: ["Run it."],
  });

  return { ...agent, result: resultOf(call, agent.requests[1]) };
}

test("009 runs a command in the project and returns its output", async (t) => {
  const agent = await runCommand(t, "cat notes.txt");

  assert.ok(toolNamesIn(agent.requests[0]).includes("bash"));
  assert.match(agent.output, /Tool: bash\(cat notes\.txt\)/);
  assert.match(agent.result, /buy milk[\s\S]*Exit code: 0/);
});

test("009 reports stderr and a failing exit code as an ordinary result", async (t) => {
  const { result, output } = await runCommand(t, "echo fine; echo broken >&2; exit 3");

  assert.match(result, /fine[\s\S]*broken[\s\S]*Exit code: 3/);
  assert.match(output, /Assistant:\s+Done\./);
});

test("009 cuts off long output and says so", async (t) => {
  const { result } = await runCommand(t, "printf 'x%.0s' {1..20000}");

  assert.ok(result.length < 9_000, `${result.length} characters went back to the model`);
  assert.match(result, /cut off[\s\S]*Exit code: 0/i);
});
