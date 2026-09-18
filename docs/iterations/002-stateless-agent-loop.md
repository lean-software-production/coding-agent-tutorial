# Stateless agent loop

Keep asking for prompts, answer each one, and stop only when the user presses Ctrl-C.

## Key concept

The feeling of an interactive agent chat comes from a loop, but without memory of the conversation, the agent is not very helpful.

## Requirements

- Run it with `npm start`.
- Keep the `You:` and `Assistant:` labels.
- After each assistant reply, ask for another prompt.
- Send only the latest user prompt to the LLM.
- Do not send previous prompts or replies.
- Stop on Ctrl-C.
- Exit cleanly on Ctrl-C, with a zero exit code and no stack trace.

## Example

Run `npm start`, then try:

```text
You: What is the capital of France?
Assistant: The capital of France is Paris.
You: What is the capital of Germany?
Assistant: The capital of Germany is Berlin.
```

You should be able to ask more than one question in the same process.

## Pressure test

Run `npm start`, then try:

```text
You: My name is Matt.
Assistant: Nice to meet you, Matt.
You: What is my name?
Assistant: I don't know your name.
```

The loop works, but each turn is isolated. This explains why the next iteration sends the conversation history back to the model.
