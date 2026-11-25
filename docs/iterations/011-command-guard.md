# Command guard

Stop the agent from doing a few things, whatever the model says.

## Key concept

The model only ever asks. Your program decides what runs, so a rule in code holds even when the prompt, the model or a file it just read says otherwise. A refusal is an ordinary tool result: the model reads why and carries on.

## Requirements

- Run it with `npm start`.
- Build on 010.
- Check every tool call in code before running it. Do not ask the human.
- Block a command or path that mentions `rm`, `git push` or `.env`.
- Answer a blocked call with a result that starts `Blocked: ` and gives the reason.
- Keep the rules in one short table of patterns and reasons.
- Remove `OPENROUTER_API_KEY` from the environment of `bash` commands.

## Example

Make two scratch files:

```sh
echo 'const count: number = 1;' > src/scratch.ts
echo 'title: new' > scratch-note.txt
```

Run `npm start`, then try:

```text
You: Push this branch to origin.
Tool: bash(git status --short --branch && git remote -v && git push origin HEAD)
Assistant: I couldn't push the branch because pushing is blocked in this environment.
```

Nothing ran, including `git status`: the guard refuses the whole call. Ask for the value of a setting in `.env` and it gets the same answer.

## Pressure test

Run `npm start`, then repeat the cleanup from 010:

```text
You: I am done with src/scratch.ts and scratch-note.txt. Clean up.
Tool: bash(rm src/scratch.ts scratch-note.txt && npm run build)
Tool: edit_file(src/scratch.ts, const count: number = 1;, )
Tool: edit_file(scratch-note.txt, title: new, )
Tool: bash(npm run build)
```

`rm` was blocked, so it emptied the files instead. Tell it to find a way and it may reach for `mv`. Patterns catch accidents, not intent: the real boundary is a sandbox that limits what the process can touch at all.

There is another limit. The guard, the habits and the tools only work in this folder. Open another project, type `npm start`, and your agent is not there. This explains why the next iteration lets you run it anywhere.

Delete `src/scratch.ts` and `scratch-note.txt` afterwards.
