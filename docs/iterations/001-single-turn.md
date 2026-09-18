# Single turn

Build a CLI that asks for one prompt, sends it to an LLM, prints one response, and exits.

## Key concept

At its core, a single agent turn is just an API request to the model provider. You provide a prompt, and it provides a response.

## Requirements

- Run it with `npm start`.
- Read `OPENROUTER_API_KEY` from the environment.
- If the key is missing, print a short error and exit non-zero.
- Send requests to the OpenAI-compatible endpoint at `OPENROUTER_BASE_URL`, or `https://openrouter.ai/api/v1` if unset.
- Ask the user for one prompt.
- Use `OPENROUTER_MODEL`, or `deepseek/deepseek-v4-flash` if unset.
- Print the assistant's reply.
- Exit after the reply.

## Example

Run `npm start`, then try:

```text
You: What is the capital of France?
Assistant: The capital of France is Paris.
```

You should see one assistant response, then the program should exit.

## Pressure test

Run `npm start`, ask one question, then try to ask a follow-up.

The program exits after the first answer, so there is no way to continue the conversation. This explains why the next iteration adds a prompt loop.
