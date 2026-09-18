# Basic read file tool

Let the agent read one project file before answering.

## Key concept

When we make an API call to the model, we can offer it tools. The model may respond with an instruction to use one of those tools instead of responding with a message.

## Requirements

- Run it with `npm start`.
- Keep the stateful loop from 003.
- Keep the better CLI UX from 004.
- Add a `read_file` tool.
- The tool takes a relative `path`.
- Only read files inside this project.
- Return read errors to the model as tool results.
- Run at most one tool call per user prompt.
- Ignore extra tool calls for that prompt.
- Print a trace before running the tool.
- If the model replies with nothing, explain why instead of printing a blank reply.

## Example

Run `npm start`, then try:

```text
You: What is this project called? Read package.json.
Tool: read_file(package.json)
Assistant: This project is called coding-agent-workshop.
```

You should see one `Tool:` line before the assistant answers.

## Pressure test

Run `npm start`, then try:

```text
You: Read package.json and tsconfig.json. Tell me the package name and TypeScript target.
```

You should see at most one `Tool:` line. Without logs, it is unclear whether the model asked for both files and the program ignored one, or whether the model only asked for one. This explains why the next iteration adds observability.
