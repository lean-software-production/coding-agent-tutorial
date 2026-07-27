# Specs

| Iteration | Spec | Status |
|---|---|---|
| 001 | [Single turn](001-single-turn.md) | Done |
| 002 | [Stateless agent loop](002-stateless-agent-loop.md) | Todo |
| 003 | [Stateful agent loop](003-stateful-agent-loop.md) | Todo |
| 004 | [Better CLI UX](004-better-cli-ux.md) | Todo |
| 005 | [Basic read file tool](005-basic-read-file-tool.md) | Todo |
| 006 | [Observability](006-observability.md) | Todo |
| 007 | [Multiple tool calls](007-multiple-tool-calls.md) | Todo |
| 008 | [Tool call loop](008-tool-call-loop.md) | Todo |

## Status

- Todo: not started
- WIP: in progress
- Done: complete

## Spec structure

Keep each spec short and consistent:

```md
# Title without the iteration number

One sentence describing the goal.

## Key concept

One short paragraph explaining the main idea this iteration teaches.

## Requirements

- Observable behavior only.
- Include inherited behavior when it matters.

## Example

A runnable manual check, with the prompt, expected trace/output, and any important assertion.

## Pressure test

A concrete scenario that exposes the remaining weakness and explains why the next iteration is needed.
```

Guidelines:

- Do not duplicate the iteration number in the title; the filename and ledger already carry it.
- Use `## Key concept` to name the lesson, not the implementation steps.
- Use `## Example` as the manual check.
- Always include `## Pressure test` to explain why the next iteration is needed.
