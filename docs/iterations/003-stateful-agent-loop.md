# Stateful agent loop

Remember the conversation for this session.

## Key concept

Conversation memory means sending previous turns back to the model on each request. The model does not remember the session by itself; the program must keep the history and include it in the next API call.

## Requirements

- Run it with `npm start`.
- Keep the prompt loop from 002.
- Keep the `You:` and `Assistant:` labels.
- Store user prompts and assistant replies in memory.
- Send the full session history to the LLM each turn.
- Do not save memory to disk.
- Stop on Ctrl-C.

## Example

Run `npm start`, then try:

```text
You: My name is Matt.
Assistant: Nice to meet you, Matt.
You: What is my name?
Assistant: Your name is Matt.
```

The assistant should use earlier turns in the same session.

## Pressure test

Run `npm start`, then try:

```text
You: Summarize README.md.
```

The conversation works, but the agent cannot inspect project files, so it can only guess or ask you to paste the file in. This explains why the next iteration adds a file-reading tool.
