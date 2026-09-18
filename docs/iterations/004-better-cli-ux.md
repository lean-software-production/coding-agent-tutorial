# Better CLI UX

Make the conversation easier to read without changing the agent behavior.

## Key concept

We are in control of the experience. We can shape the terminal UI we want from our coding agent without changing the underlying agent behavior.

## Requirements

- Run it with `npm start`.
- Keep the stateful loop from 003.
- Keep the `You:` and `Assistant:` labels.
- Add simple color to the conversation labels.
- Render assistant replies as terminal-friendly Markdown.
- Print a subtle horizontal rule after each assistant reply.
- Keep the UX code small and easy to read.

## Example

Run `npm start`, then try:

```text
You: Give me a short Markdown list of three fruits.
Assistant:
• Apple
• Banana
• Cherry
────────────────────────────────────────
```

The labels should be colored, Markdown should be readable in the terminal, and each reply should end with a subtle separator.

## Pressure test

Run `npm start`, then try:

```text
You: Summarize README.md.
```

The UI is nicer, but the agent cannot inspect project files, so it can only guess or ask you to paste the file. This explains why the next iteration adds a file-reading tool.
