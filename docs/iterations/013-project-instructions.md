# Project instructions

Tell the agent the rules of the project it is working in.

## Key concept

`AGENTS.md` is a convention many coding agents share: a file of instructions for agents, kept with the project. Your habits travel with the agent; the rules belong to the workspace. Both reach the model the same way, as text in the system message.

## Requirements

- Build on 012.
- Add the workspace's `AGENTS.md`, if there is one, to the end of the system message.
- There is still exactly one system message.
- Read the file once, when the agent starts.

A cloned project's `AGENTS.md` is someone else's text, now speaking with the authority of your system prompt to an agent that has `bash`. The command guard still applies; the instructions are only words. Read the file before you run an agent on code you do not trust.

## Example

In `~/shopping` from 012, run your agent again:

```text
You: What is the capital of France?
Assistant: Paris. Ahoy
```

Now go back to this folder, which has an `AGENTS.md` of its own, and say the words that started all this:

```text
You: coach me
Tool: read_file(.agents/iterate-coach.md)
Tool: bash(bin/setup --check)
Tool: read_file(docs/iterations/README.md)
```

Your own agent is now the coach. It went straight to the right file, because `AGENTS.md` says what "coach me" means. It needs your key in `.env` for this: the command guard hides `OPENROUTER_API_KEY` from the setup check, so a key that is only in the environment looks missing.

## Pressure test

In `~/shopping`, make the instructions long, and ask about something else entirely:

```sh
for i in $(seq 1 200); do echo 'When you write a test, run it and watch it fail first.'; done >> AGENTS.md
my-agent
```

```text
You: What is the capital of France?
Assistant: Paris. Ahoy
```

Compare the last lines of `agent.log` before and after:

```text
[llm] response: assistant text: 36 chars, 216 prompt tokens
[llm] response: assistant text: 10 chars, 3016 prompt tokens
```

Every request now pays for testing advice, and a question about France has no use for it. Some instructions matter only for some tasks. This explains why the next iteration loads them when they are needed.
