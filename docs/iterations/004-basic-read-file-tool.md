# Basic read file tool

Let the agent read one project file before answering.

## Key concept

When we make an API call to the model, we can offer it tools. The model may respond with an instruction to use one of those tools instead of responding with a message.

## Requirements

- Run it with `npm start`.
- Keep the stateful loop from 003.
- Add a `read_file` tool.
- The tool takes a relative `path`.
- Only read files inside this project.
- Return read errors to the model as tool results.
- Run at most one tool call per user prompt.
- Ignore extra tool calls for that prompt, and leave them out of the history: the API rejects a tool call that has no result.
- Print a trace before running the tool: its name, with the argument values in parentheses.
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

You should see exactly one `Tool:` line. What comes after it varies: the model may answer half the question, guess the other half, or ask for the second file and get your "replied with nothing" message. Nothing on screen says whether it asked for both files and the program ignored one, or only ever asked for one. This explains why the next iteration adds observability.
