# Skills

Give the agent instructions it loads only when a task calls for them.

## Key concept

A skill is a folder with a `SKILL.md`: a name and a description, then the instructions. The model sees every name and description from the start, and reads the instructions only when it decides it needs them. This is the [Agent Skills](https://agentskills.io) standard, so the same skill works in other agents too.

## Requirements

- Build on 013.
- Find skills at `.agents/skills/<folder>/SKILL.md`, in the workspace and in the user's home folder.
- `SKILL.md` starts with YAML frontmatter that has a `name` and a `description`. Parse it with the `yaml` package.
- List each skill's name and description in the system message. Leave the instructions out.
- Add a `skill` tool. It takes a `name` and returns the text of that `SKILL.md`, or an error result that repeats the name.
- If a project skill and a personal skill share a name, use the project's and print `Project skill <name> replaces your personal one.`
- If a skill has no valid name and description, skip it and print `Skipped <path>` and why.
- Load the skills once, when the agent starts, and print `Skills: <count>`.
- Keep the loading code in `src/skills.ts`.

Like `AGENTS.md`, a skill in a cloned project is someone else's instructions to an agent with `bash`. Read it before you run the agent there.

## Example

Write a skill for working test-first, in `.agents/skills/tdd/SKILL.md`. Use your own words:

```md
---
name: tdd
description: Use when writing or changing code, to work test-first.
---

1. Write one failing test. Run it and read why it fails.
2. Write the least code that passes. Run it again.
3. Tidy up while the test stays green, then start the next test.

Never write code before a failing test asks for it, and never change a test to make it pass.
```

Start your agent and ask for some code, without mentioning the skill:

```text
Skills: 1
You: Write isLeapYear(year) in scratch/leap.ts. Run its tests with: node --test 'scratch/*.test.ts'
Tool: skill(tdd)
Tool: bash(cat > scratch/leap.test.ts ...)
Tool: bash(node --test 'scratch/*.test.ts')
```

Your `Skills:` count includes any in `~/.agents/skills`. Ask it for the capital of France and there is no `skill` call. Delete `scratch` afterwards.

## Pressure test

Ask for something that takes a lot of reading, then something that takes none:

```text
You: Read every spec in docs/iterations and summarize each in one line.
You: What is the capital of France?
```

Compare the prompt tokens in `agent.log`:

```text
[llm] response: tool_calls: bash(find docs/iterations ...), 800 prompt tokens
[llm] response: assistant text: 6 chars, 9834 prompt tokens
```

The summary was the only thing you wanted to keep, but every file it read is still in the conversation and goes back to the model with every request. This explains why the next iteration hands the reading to an agent that can forget it.

## Stretch

Let the human load a skill too: `/tdd write isLeapYear` sends the task together with the skill's instructions. Then make `/` on its own list the skills to choose from.
