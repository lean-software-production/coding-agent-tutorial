# Subagents

Let the agent hand a task to another agent and keep only the answer.

## Key concept

A subagent is the loop you already have, called as a tool. It starts with an empty conversation, does its own reading, and returns its last reply as the tool result. Everything it read is forgotten; the conversation that asked for it grows by one answer.

## Requirements

- Build on 014.
- Move the tool-call loop into a function that takes a task and a conversation, and returns the final text. The prompt loop calls it.
- Add a `subagent` tool. It takes a `task`, runs that function on a new conversation, and returns the text.
- A new conversation holds the same system message and the task, and nothing from the conversation that asked.
- A subagent has every tool except `subagent`.
- Subagents run one at a time, in order.

## Example

Repeat the pressure test from 014, this time with a subagent:

```text
You: Use a subagent to read every spec in docs/iterations and summarize each in one line.
Tool: subagent(Read every spec file in docs/iterations ...)
Tool: bash(find docs/iterations -type f)
Tool: read_file(docs/iterations/001-single-turn.md)
...
You: What is the capital of France?
```

In `agent.log`, the subagent's conversation grew and the main one did not:

```text
[llm] response: assistant text: 1693 chars, 9464 prompt tokens
[tool] subagent(Read every spec file in docs/iterations ...): 1693 chars
[llm] response: assistant text: 1693 chars, 1334 prompt tokens
[llm] response: assistant text: 35 chars, 1736 prompt tokens
```

The question about France cost 9834 prompt tokens in 014. Now try three:

```text
You: Use three subagents, one each for src, test and docs, to summarize what is in them. Then combine their answers into one short overview.
```

## Pressure test

Look at the `Tool:` lines from the three subagents. They ran one after another, though none of them needed the others, and the whole thing took about a minute. Each started knowing nothing, so anything the main agent left out of the `task` was lost, and all you have of their work is what they chose to say about it.

Would you trust one to check your work? Find out: see "The kata, part two" in the top-level README.

## Stretch

When every call in a batch is a `subagent`, run them at the same time, and return the results in order.
