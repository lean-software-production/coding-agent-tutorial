# Observability

Write a small log so we can see what the model asked for.

## Key concept

Tool calling can get complicated quickly, so a little logging helps us see what the model asked for, what tools ran, and what came back.

## Requirements

- Run it with `npm start`.
- Build on 004.
- Append concise logs to `agent.log`.
- Add `agent.log` to `.gitignore`.
- Keep the logging code in `src/index.ts`.
- Start each entry with a timestamp, and use the log shape below.
- Before each model request, log the message count and available tool names.
- After each model response, log one of `tool_calls`, `assistant text` or `empty`, and the prompt tokens it used.
- For tool calls, log the tool names and arguments.
- After each tool result, log the tool name, path, and result length.
- If a model request fails, log `[llm] failed:` and the error message, then let the error stop the program.
- Do not log full file contents.

## Example

Run `npm start`, then try:

```text
You: Read README.md and src/index.ts. Tell me the first line of each.
```

Then inspect `agent.log`. It should show the model request, any tool calls, tool results, and final assistant response without logging full file contents.

Example log shape:

```text
2026-07-08T12:00:00.000Z [llm] request: 4 messages, tools: read_file
2026-07-08T12:00:01.000Z [llm] response: tool_calls: read_file(README.md), 512 prompt tokens
2026-07-08T12:00:01.100Z [tool] read_file(README.md): 358 chars
2026-07-08T12:00:02.000Z [llm] response: assistant text: 124 chars, 640 prompt tokens
```

## Pressure test

Run `npm start`, then try:

```text
You: Read package.json and tsconfig.json. Tell me the package name and TypeScript target.
```

Inspect `agent.log`. The model asked for both files, in one response or one after the other, but there is only one `[tool]` line. The agent dropped a call the model needed, and now you can see it. This explains why the next iteration runs a whole batch of tool calls.
