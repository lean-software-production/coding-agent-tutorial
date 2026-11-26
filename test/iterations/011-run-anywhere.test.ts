import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

import { runAgent } from "./support/agent.ts";
import { resultOf } from "./support/fake-model.ts";
import { calls, says, tool } from "./support/model-script.ts";

test("011 works on the folder it was started in and logs in its own home", async (t) => {
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

test("011 loads .env from its own home, never from the workspace", async (t) => {
  const agent = await runAgent(t, {
    files: { ".env": "OPENROUTER_API_KEY=home-key" },
    workspace: { ".env": "OPENROUTER_API_KEY=workspace-key\nOPENROUTER_MODEL=workspace/model" },
    environment: { OPENROUTER_API_KEY: undefined, OPENROUTER_MODEL: undefined },
    replies: [says("Hello.")],
    prompts: ["Hello?"],
  });

  assert.equal(agent.requests[0]?.apiKey, "home-key");
  assert.notEqual(agent.requests[0]?.model, "workspace/model");
});

test("011 names a command that Node runs", async () => {
  const project = new URL("../../", import.meta.url);
  const { bin } = JSON.parse(await readFile(new URL("package.json", project), "utf8"));
  const command = new URL(String(Object.values(bin ?? {})[0]), project);

  assert.match(await readFile(command, "utf8"), /^#!\/usr\/bin\/env node\n/);
});
