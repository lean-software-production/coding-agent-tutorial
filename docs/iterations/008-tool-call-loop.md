# Tool call loop

Let the agent keep running tools until it can answer.

## Key concept

To fulfill a prompt, the model might need to run a tool, examine the tool output, and then run another tool. It may need to do this multiple times before it can answer.

## Requirements

- Run it with `npm start`.
- Build on 007.
- Keep the stateful loop.
- Keep the `read_file` tool.
- Handle every tool call in each assistant tool-call response.
- Return tool results to the model.
- If the model asks for more tools, run the next batch.
- Stop when the model returns a final answer.
- Print one trace per tool call.
- Limit each user prompt to 5 tool-call rounds.
- If the limit is reached, print a short error.

## Example

Run `npm start`, then try:

```text
You: Read package.json, then read the entry point named by its main, bin, or start script. Summarize both files.
Tool: read_file(package.json)
Tool: read_file(src/index.ts)
Assistant: package.json defines the project and start script. src/index.ts contains the CLI agent implementation.
```

The second tool call may happen only after the model has seen `package.json`.

## Pressure test

Run `npm start`, then try:

```text
You: Inspect the project tree and tell me what files are in src.
```

The tool loop works, but the only tool is `read_file`; the agent cannot inspect directories or search for unknown files. This explains why a future iteration would add file listing or search tools.
