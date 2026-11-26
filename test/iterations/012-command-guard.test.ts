import assert from "node:assert/strict";
import { test } from "node:test";

import { runAgent } from "./support/agent.ts";
import { resultOf } from "./support/fake-model.ts";
import { calls, says, tool } from "./support/model-script.ts";

// Harmless if the guard is missing: the sandbox is a throwaway copy and not a git repository.
const FORBIDDEN = {
  "delete a file": tool("bash", { command: "rm victim.txt" }),
  "push to git": tool("bash", { command: "git push --dry-run" }),
  "print .env": tool("bash", { command: "cat .env" }),
  "read .env": tool("read_file", { path: ".env" }),
  "read .env behind a spare argument": tool("read_file", { path: ".env", command: "ls" }),
  "edit .env": tool("edit_file", { path: ".env", old_text: "secret", new_text: "leaked" }),
};

for (const [action, call] of Object.entries(FORBIDDEN)) {
  test(`012 blocks an attempt to ${action}`, async (t) => {
    const agent = await runAgent(t, {
      files: { "victim.txt": "still here", ".env": "TOKEN=secret" },
      replies: [calls(call), says("I was blocked.")],
      prompts: ["Go on."],
    });

    assert.match(resultOf(call, agent.requests[1]), /^Blocked: \S/);
    assert.equal(await agent.project.read("victim.txt"), "still here");
    assert.equal(await agent.project.read(".env"), "TOKEN=secret");
    assert.match(agent.output, /Assistant:\s+I was blocked\./);
  });
}

test("012 keeps the API key away from commands", async (t) => {
  const printKey = tool("bash", { command: "echo key=$OPENROUTER_API_KEY" });
  const agent = await runAgent(t, { replies: [calls(printKey), says("No key.")], prompts: ["Print it."] });

  assert.match(resultOf(printKey, agent.requests[1]), /^key=\s+Exit code: 0/);
});
