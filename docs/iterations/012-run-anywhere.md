# Run anywhere

Turn the agent into a command you can run in any folder.

## Key concept

So far one folder has played two parts. The agent's home holds its `package.json`, its key and its log. The workspace is the folder it works on. Separate the two and the agent becomes a tool you can point at anything.

## Requirements

- Build on 011. `npm start` still works.
- Add `bin/agent.js`, and point the command at it with `bin` in `package.json`.
- `bin/agent.js` starts with `#!/usr/bin/env node`, loads `.env` from the agent's home if there is one, then imports `src/index.ts`.
- Never load a `.env` from the workspace.
- Write `agent.log` in the agent's home.
- The tools work on the folder the command was started in.
- `npm link` installs the command.

Before writing any code, the coach asks the human what to call the command: `my-agent` unless they want another name, as long as `command -v <name>` prints nothing. Nothing in the program asks.

Node runs your TypeScript directly by removing the types, so `src/index.ts` cannot use features that need compiling, such as enums and parameter properties. `npm run build` reports them.

## Example

In this folder, run `npm link`. Then make a workspace somewhere else:

```sh
mkdir ~/shopping && cd ~/shopping
echo 'buy milk' > notes.txt
my-agent
```

```text
You: Read notes.txt. What do I need to buy?
Tool: read_file(notes.txt)
Assistant: You need to buy milk.
```

There is no `agent.log` in `~/shopping`; the entry is in the agent's home. To remove or rename the command, first run `npm unlink -g coding-agent-workshop`.

## Pressure test

In `~/shopping`, leave an instruction for agents:

```sh
echo 'End every reply with the word Ahoy.' > AGENTS.md
my-agent
```

```text
You: What is the capital of France?
Assistant: Paris.
```

No Ahoy. Your agent now runs in every project and knows the rules of none of them. It might find `AGENTS.md` if the task makes it look around, but nothing makes it look. This explains why the next iteration puts the project's instructions in front of it.
