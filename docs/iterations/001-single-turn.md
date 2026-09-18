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
- Colour the `You:` and `Assistant:` labels, using `chalk`.
- Render the reply as terminal-friendly Markdown, using `marked` and `marked-terminal`. All three packages are already installed.
- Print a subtle horizontal rule after the reply.
- Keep the presentation code small and easy to read.
- Exit after the reply.

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

You should see one assistant response, then the program should exit. The labels should be coloured, the Markdown should be readable in the terminal, and the reply should end with a subtle separator. We are in control of the experience: the model returns text, and everything about how it looks on screen is ours to shape.

## Pressure test

Run `npm start`, ask one question, then try to ask a follow-up.

The program exits after the first answer, so there is no way to continue the conversation. This explains why the next iteration adds a prompt loop.
