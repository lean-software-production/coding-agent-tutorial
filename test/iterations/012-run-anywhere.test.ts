import assert from "node:assert/strict";
import { test } from "node:test";

import { runAgent } from "./support/agent.ts";
import { resultOf } from "./support/fake-model.ts";
import { calls, says, tool } from "./support/model-script.ts";

test("012 works on the folder it was started in and logs in its own home", async (t) => {
  const readNotes = tool("read_file", { path: "notes.txt" });
  const agent = await runAgent(t, {
    workspace: { "notes.txt": "buy milk" },
    replies: [calls(readNotes), says("You need milk.")],
    prompts: ["What do I need?"],
  });

  assert.match(agent.output, /Assistant:\s+You need milk\./);
  assert.equal(resultOf(readNotes, agent.requests[1]), "buy milk");
  assert.match(await agent.project.read("agent.log"), /read_file\(notes\.txt\)/);
  await assert.rejects(agent.workspace.read("agent.log"));
});

test("012 takes its key from its own home, never from the workspace", async (t) => {
  const agent = await runAgent(t, {
    files: { ".env": "OPENROUTER_API_KEY=home-key" },
    workspace: { ".env": "OPENROUTER_API_KEY=workspace-key" },
    environment: { OPENROUTER_API_KEY: undefined },
    replies: [says("Hello.")],
    prompts: ["Hello?"],
  });

  assert.equal(agent.requests[0]?.apiKey, "home-key");
});

test("012 names its command in package.json", async (t) => {
  const agent = await runAgent(t, { workspace: {}, replies: [], prompts: [] });
  const { bin } = JSON.parse(await agent.project.read("package.json"));

  assert.deepEqual(Object.values(bin), ["bin/agent.js"]);
  assert.match(await agent.project.read("bin/agent.js"), /^#!\/usr\/bin\/env node\n/);
});
