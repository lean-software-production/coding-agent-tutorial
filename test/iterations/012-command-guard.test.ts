import assert from "node:assert/strict";
import { test, type TestContext } from "node:test";

import { runAgent } from "./support/agent.ts";
import { resultOf } from "./support/fake-model.ts";
import { calls, says, tool, type ToolCall } from "./support/model-script.ts";
import type { Answer } from "./support/terminal.ts";

const FILES = { "victim.txt": "still here", ".env": "TOKEN=secret", "settings.json": "{}" };

// Harmless if the guard is missing: the sandbox is a throwaway copy and not a git repository.
const RISKY: Record<string, ToolCall> = {
  "delete a file": tool("bash", { command: "rm victim.txt" }),
  "force-push": tool("bash", { command: "git push --force --dry-run" }),
  "print .env": tool("bash", { command: "cat .env" }),
  "read .env": tool("read_file", { path: ".env" }),
  "read .env behind a spare argument": tool("read_file", { path: ".env", command: "ls" }),
  "edit .env": tool("edit_file", { path: ".env", old_text: "secret", new_text: "leaked" }),
  "edit its own settings": tool("edit_file", { path: "settings.json", old_text: "{}", new_text: '{"delete":"allow"}' }),
};

function attempt(t: TestContext, call: ToolCall, answers: readonly Answer[]) {
  return runAgent(t, { files: FILES, answers, replies: [calls(call), says("Done.")], prompts: ["Go on."] });
}

for (const [action, call] of Object.entries(RISKY)) {
  test(`012 asks before it tries to ${action}, and blocks it on no`, async (t) => {
    const agent = await attempt(t, call, ["n"]);

    assert.equal(agent.questions, 1);
    assert.match(resultOf(call, agent.requests[1]), /^Blocked: \S/);
    assert.equal(await agent.project.read("victim.txt"), "still here");
    assert.equal(await agent.project.read(".env"), "TOKEN=secret");
    assert.equal(await agent.project.read("settings.json"), "{}");
    assert.match(agent.output, /Assistant:\s+Done\./);
  });
}

test("012 runs a risky call when the human says yes", async (t) => {
  const deleteVictim = RISKY["delete a file"];
  const agent = await attempt(t, deleteVictim, ["y"]);

  assert.match(agent.output, /Allow[^\n]*rm victim\.txt[^\n]*delete/);
  assert.match(resultOf(deleteVictim, agent.requests[1]), /Exit code: 0/);
  await assert.rejects(agent.project.read("victim.txt"));
});

test("012 takes allow and deny from settings.json without asking", async (t) => {
  const settings = JSON.stringify({ delete: "allow", secrets: "deny" });
  const deleteVictim = RISKY["delete a file"];
  const printSecrets = RISKY["print .env"];
  const agent = await runAgent(t, {
    files: { ...FILES, "settings.json": settings },
    replies: [calls(deleteVictim, printSecrets), says("Done.")],
    prompts: ["Go on."],
  });

  assert.equal(agent.questions, 0);
  assert.match(resultOf(deleteVictim, agent.requests[1]), /Exit code: 0/);
  assert.match(resultOf(printSecrets, agent.requests[1]), /^Blocked: \S/);
});

test("012 ignores a settings.json in the workspace", async (t) => {
  const deleteVictim = RISKY["delete a file"];
  const agent = await runAgent(t, {
    workspace: { "victim.txt": "still here", "settings.json": JSON.stringify({ delete: "allow" }) },
    answers: ["n"],
    replies: [calls(deleteVictim), says("Done.")],
    prompts: ["Go on."],
  });

  assert.equal(agent.questions, 1);
  assert.equal(await agent.workspace.read("victim.txt"), "still here");
});

test("012 keeps the API key away from commands", async (t) => {
  const printKey = tool("bash", { command: "echo key=$OPENROUTER_API_KEY" });
  const agent = await runAgent(t, { replies: [calls(printKey), says("No key.")], prompts: ["Print it."] });

  assert.match(resultOf(printKey, agent.requests[1]), /^key=\s+Exit code: 0/);
});
