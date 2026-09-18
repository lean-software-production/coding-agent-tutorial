# Multiple tool calls

Let the agent run one batch of tool calls before answering.

## Key concept

A model may ask for several independent tool calls at once. The agent should run the whole batch, preserve the order, and return all the results before asking the model to answer.

## Requirements

- Run it with `npm start`.
- Build on 006.
- Keep the `read_file` tool.
- Handle every tool call in the assistant's first tool-call response.
- Treat those tool calls as one batch.
- Print one trace per tool call.
- Return all tool results to the model before asking for the final answer.
- Preserve the tool-call order when returning results.
- Run at most one tool-call batch per user prompt.
- If the model asks for more tools after the batch, print a short error.

## Example

Run `npm start`, then try:

```text
You: Read package.json and tsconfig.json. Tell me the package name and TypeScript target.
Tool: read_file(package.json)
Tool: read_file(tsconfig.json)
Assistant: The package name is coding-agent-workshop. The TypeScript target is ES2022.
```

You should see one `Tool:` line per requested file before the assistant answers.

## Pressure test

Run `npm start`, then try:

```text
You: Read package.json, then read the entry point named by its main, bin, or start script. Summarize both files.
```

The agent may need the `package.json` result before it knows which file to read next. One batch is not enough for that sequential discovery. This explains why the next iteration adds a tool-call loop.
