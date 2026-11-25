import assert from "node:assert/strict";
import { test } from "node:test";

import { runAgent } from "./support/agent.ts";
import { resultOf } from "./support/fake-model.ts";
import { calls, says, tool } from "./support/model-script.ts";

const skill = (name: string, description: string, body: string) =>
  `---\nname: ${name}\ndescription: ${description}\n---\n\n${body}\n`;

const tdd = skill("tdd", "Use when writing code test-first.", "Write one failing test.");
const haiku = skill("haiku", "Use when asked for a poem.", "Count the syllables.");

test("014 tells the model which skills exist, and loads one when asked", async (t) => {
  const loadTdd = tool("skill", { name: "tdd" });
  const agent = await runAgent(t, {
    files: { ".agents/skills/tdd/SKILL.md": tdd },
    userHome: { ".agents/skills/haiku/SKILL.md": haiku },
    replies: [calls(loadTdd), says("Test first.")],
    prompts: ["Build it."],
  });

  const system = String(agent.requests[0]?.messages[0]?.content);
  assert.match(agent.output, /Skills: 2/);
  assert.match(system, /tdd[^\n]*Use when writing code test-first\./);
  assert.match(system, /haiku[^\n]*Use when asked for a poem\./);
  assert.doesNotMatch(system, /Write one failing test|Count the syllables/);
  assert.match(resultOf(loadTdd, agent.requests[1]), /Write one failing test\./);
});

test("014 prefers a project skill to a personal one and says so", async (t) => {
  const loadTdd = tool("skill", { name: "tdd" });
  const agent = await runAgent(t, {
    files: { ".agents/skills/tdd/SKILL.md": tdd },
    userHome: { ".agents/skills/tdd/SKILL.md": skill("tdd", "Mine.", "My personal steps.") },
    replies: [calls(loadTdd), says("Test first.")],
    prompts: ["Build it."],
  });

  assert.match(agent.output, /Skills: 1/);
  assert.match(agent.output, /Project skill tdd/);
  assert.match(resultOf(loadTdd, agent.requests[1]), /Write one failing test\./);
});

test("014 skips a malformed skill and says so", async (t) => {
  const agent = await runAgent(t, {
    files: {
      ".agents/skills/plain/SKILL.md": "No frontmatter here.",
      ".agents/skills/unnamed/SKILL.md": "---\nname: unnamed\n---\n\nNo description.\n",
      ".agents/skills/tdd/SKILL.md": tdd,
    },
    replies: [says("Hello.")],
    prompts: ["Hello?"],
  });

  assert.match(agent.output, /Skipped [^\n]*plain/);
  assert.match(agent.output, /Skipped [^\n]*unnamed/);
  assert.match(agent.output, /Skills: 1/);
  assert.match(agent.output, /Assistant:\s+Hello\./);
});

test("014 answers an unknown skill with an error the model can read", async (t) => {
  const unknown = tool("skill", { name: "juggling" });
  const agent = await runAgent(t, { replies: [calls(unknown), says("No such skill.")], prompts: ["Juggle."] });

  assert.match(agent.output, /Assistant:\s+No such skill\./);
  assert.match(resultOf(unknown, agent.requests[1]), /^Error:.*juggling/);
});
