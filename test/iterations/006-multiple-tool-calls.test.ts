import assert from "node:assert/strict";
import { test } from "node:test";

import { runAgent } from "./support/agent.ts";
import { toolResultsIn } from "./support/fake-model.ts";
import { calls, says, tool } from "./support/model-script.ts";

test("006 runs every call in the batch and returns the results in order", async (t) => {
  const agent = await runAgent(t, {
    files: { "a.txt": "apple", "b.txt": "banana" },
    replies: [
      calls(tool("read_file", { path: "a.txt" }), tool("read_file", { path: "b.txt" })),
      says("An apple and a banana."),
    ],
    prompts: ["Read a.txt and b.txt."],
  });

  assert.match(agent.output, /Tool: read_file\(a\.txt\)\s+Tool: read_file\(b\.txt\)\s+Assistant:/);
  assert.deepEqual(toolResultsIn(agent.requests[1]).map((result) => result.content), ["apple", "banana"]);
});
