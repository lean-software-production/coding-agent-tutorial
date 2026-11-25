import assert from "node:assert/strict";
import { test } from "node:test";

import { runAgent } from "./support/agent.ts";
import { callsWithoutResults, resultOf, toolNamesIn } from "./support/fake-model.ts";
import { calls, says, tool } from "./support/model-script.ts";

test("004 reads the file the model asks for, then answers", async (t) => {
  const readNotes = tool("read_file", { path: "notes.txt" });
  const agent = await runAgent(t, {
    files: { "notes.txt": "buy milk" },
    replies: [calls(readNotes), says("You need milk.")],
    prompts: ["What do I need?"],
  });

  assert.ok(toolNamesIn(agent.requests[0]).includes("read_file"));
  assert.match(agent.output, /Tool: read_file\(notes\.txt\)[\s\S]*Assistant:\s+You need milk\./);
  assert.equal(resultOf(readNotes, agent.requests[1]), "buy milk");
});

test("004 refuses to read outside the project", async (t) => {
  const readSecret = tool("read_file", { path: "../secret.txt" });
  const agent = await runAgent(t, {
    files: { "../secret.txt": "top secret" },
    replies: [calls(readSecret), says("I cannot read that.")],
    prompts: ["What is the secret?"],
  });

  assert.match(agent.output, /Assistant:\s+I cannot read that\./);
  assert.doesNotMatch(resultOf(readSecret, agent.requests[1]), /top secret/);
});

test("004 tells the model when a file cannot be read", async (t) => {
  const readMissing = tool("read_file", { path: "missing.txt" });
  const agent = await runAgent(t, {
    replies: [calls(readMissing), says("It is not there.")],
    prompts: ["What is in missing.txt?"],
  });

  assert.match(agent.output, /Assistant:\s+It is not there\./);
  assert.match(resultOf(readMissing, agent.requests[1]), /ENOENT|no such|not found/i);
});

test("004 never sends back a tool call without its result", async (t) => {
  const agent = await runAgent(t, {
    files: { "a.txt": "apple", "b.txt": "banana" },
    replies: [
      calls(tool("read_file", { path: "a.txt" }), tool("read_file", { path: "b.txt" })),
      says("I read what I could."),
    ],
    prompts: ["Read a.txt and b.txt."],
  });

  assert.match(agent.output, /Assistant:\s+I read what I could\./);
  assert.deepEqual(callsWithoutResults(agent.requests[1]), []);
});

test("004 explains an empty reply", async (t) => {
  const agent = await runAgent(t, { replies: [says("")], prompts: ["Hello?"] });

  assert.match(agent.output, /Assistant:\s+\w+/);
});
