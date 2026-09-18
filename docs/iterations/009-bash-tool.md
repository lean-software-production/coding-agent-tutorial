# Bash tool

Let the agent run commands and read what came back.

## Key concept

A shell closes the loop: the agent can now change a file and then check its own work. Your terminal is invisible to the model, so a command that fails only reaches it if you put the output and the exit code into the tool result. A non-zero exit is an ordinary result, not an error in the agent.

## Requirements

- Run it with `npm start`.
- Build on 008.
- Keep the `read_file` and `edit_file` tools and the tool-call loop.
- Add a `bash` tool.
- The tool takes a `command` string.
- Run it with `bash -c` from the project root.
- Return stdout and stderr together, followed by the exit code, as the tool result.
- Treat a non-zero exit as a result to report, not a failure to handle.
- Cut the output off after about 8000 characters and say so in the result.
- Kill a command still running after 30 seconds and say so in the result.
- Print a trace before running each tool.

## Example

Run `npm start`, then ask for the thing 008 could only half-do:

```text
You: Rename the Tool: label in src/index.ts to Using:, and make sure it still compiles.
Tool: read_file(src/index.ts)
Tool: edit_file(src/index.ts, `Tool: ${describe(call)}`, `Using: ${describe(call)}`)
Tool: bash(npx tsc --noEmit)
Assistant: Done. The label is now "Using:" and the project compiles with no errors.
```

The third trace is the one that makes the first two worth anything. Put the file back with `git checkout src/index.ts`.

You can watch the timeout too:

```text
You: Run this exact command: sleep 45
Tool: bash(sleep 45)
Assistant: The command was killed after 30 seconds without finishing.
```

Nothing told the model about the timeout except the string your tool sent back.

## Pressure test

Plant a type error:

```sh
echo 'const count: number = "one";' > src/scratch.ts
echo 'title: old' > scratch-note.txt
```

Run `npm start`, then ask for two things at once:

```text
You: Check the project compiles, then change the title in scratch-note.txt to new.
Tool: bash(npx tsc --noEmit)
Tool: read_file(scratch-note.txt)
Tool: edit_file(scratch-note.txt, title: old, title: new)
Assistant: Done. The compile found one error in src/scratch.ts, and the title is now "new".
```

It ran the check, saw the error, reported it accurately, and carried on as though nothing had happened. It has every tool a coding agent needs and none of the habits: nothing tells it that a red check comes before a new edit. Tools are what it can do. This explains why the next iteration tells it what it should do.

Delete `src/scratch.ts` and `scratch-note.txt` afterwards.
