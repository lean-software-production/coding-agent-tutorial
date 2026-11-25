import assert from "node:assert/strict";
import { test } from "node:test";

import { runAgent } from "./support/agent.ts";
import { resultOf, toolNamesIn } from "./support/fake-model.ts";
import { calls, says, tool } from "./support/model-script.ts";

const edit = (path: string, oldText: string, newText: string) =>
  tool("edit_file", { path, old_text: oldText, new_text: newText });

test("008 edits a file by exact replacement", async (t) => {
  const agent = await runAgent(t, {
    files: { "note.txt": "title: old" },
    replies: [calls(edit("note.txt", "old", "new")), says("Done.")],
    prompts: ["Change the title."],
  });

  assert.ok(toolNamesIn(agent.requests[0]).includes("edit_file"));
  assert.match(agent.output, /Tool: edit_file\(note\.txt, old, new\)/);
  assert.equal(await agent.project.read("note.txt"), "title: new");
});

test("008 puts new text in exactly as the model wrote it", async (t) => {
  const agent = await runAgent(t, {
    files: { "price.txt": "price: old" },
    replies: [calls(edit("price.txt", "old", "$& and $1")), says("Done.")],
    prompts: ["Change the price."],
  });

  assert.equal(await agent.project.read("price.txt"), "price: $& and $1");
});

for (const [problem, text] of [["missing", "nothing here"], ["repeated", "old and old"]]) {
  test(`008 leaves the file alone when the old text is ${problem}`, async (t) => {
    const change = edit("note.txt", "old", "new");
    const agent = await runAgent(t, {
      files: { "note.txt": text },
      replies: [calls(change), says("I could not.")],
      prompts: ["Change it."],
    });

    assert.match(agent.output, /Assistant:\s+I could not\./);
    assert.match(resultOf(change, agent.requests[1]), /^Error:/);
    assert.equal(await agent.project.read("note.txt"), text);
  });
}

test("008 refuses to edit outside the project", async (t) => {
  const change = edit("../note.txt", "old", "new");
  const agent = await runAgent(t, {
    files: { "../note.txt": "old" },
    replies: [calls(change), says("I could not.")],
    prompts: ["Change it."],
  });

  assert.match(resultOf(change, agent.requests[1]), /^Error:/);
  assert.equal(await agent.project.read("../note.txt"), "old");
});

test("008 answers an unknown tool with an error the model can read", async (t) => {
  const unknown = tool("make_coffee", { size: "large" });
  const agent = await runAgent(t, { replies: [calls(unknown), says("No coffee.")], prompts: ["Coffee?"] });

  assert.match(agent.output, /Assistant:\s+No coffee\./);
  assert.match(resultOf(unknown, agent.requests[1]), /^Error:.*make_coffee/);
});
