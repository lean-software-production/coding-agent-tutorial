# Coding system prompt

Give the agent working habits, so it checks its own work instead of announcing that it is done.

## Key concept

Every iteration so far gave the agent something it could not do before. This one gives it nothing new; it changes how it uses what it has. A `system` message sits at the front of the conversation and the model re-reads it before every reply, which makes it the cheapest lever in the program: one string, no new code path.

## Requirements

- Run it with `npm start`.
- Build on 009.
- Keep all three tools and the tool-call loop.
- Put a `system` message at the front of the conversation, before the first user prompt.
- Add it to the conversation once. Every request then starts with it, including the ones inside the tool-call loop.
- Keep its content to a handful of working habits in plain sentences, short enough to read aloud. For example: read a file before you change it; run the check after you change anything and read what it printed; a failing check is the only thing you work on until it passes; never say a job is done unless a command you ran says so.
- Keep the prompt text in `src/index.ts`, in one clearly named constant.

## Example

Run `npm start` and ask for a change, saying nothing about checking:

```text
You: Rename the Tool: label in src/index.ts to Using:.
Tool: read_file(src/index.ts)
Tool: edit_file(src/index.ts, `Tool: ${describe(call)}`, `Using: ${describe(call)}`)
Tool: bash(npx tsc --noEmit)
Assistant: Done. The label is now "Using:" and the project still compiles.
```

Nobody asked for the third trace. Run the same prompt against 009 and it is not there. Your own run will wander more than this one; the shape does not. Put the file back with `git checkout src/index.ts`.

Now comment out the `system` message and ask again. That is the whole iteration, and it costs one line either way.

## Pressure test

Plant the same failure as 009:

```sh
echo 'const count: number = "one";' > src/scratch.ts
echo 'title: old' > scratch-note.txt
```

Run `npm start`, then try:

```text
You: Check the project compiles, then change the title in scratch-note.txt to new.
Tool: bash(npm run build)
Tool: read_file(src/scratch.ts)
Tool: edit_file(src/scratch.ts, const count: number = "one";, const count: number = 1;)
Tool: bash(npm run build)
Tool: read_file(scratch-note.txt)
Tool: edit_file(scratch-note.txt, title: old, title: new)
Assistant: Done. The project compiles and the title is now "new".
```

It stopped. 009 walked past the red check; four sentences of prompt made it deal with the failure first. Now ask it to tidy up:

```text
You: I am done with src/scratch.ts and scratch-note.txt. Clean up.
Tool: bash(rm src/scratch.ts scratch-note.txt)
Assistant: Removed src/scratch.ts and scratch-note.txt.
```

That was the right `rm`. Nothing made it so. The model picks the command, and the program runs whatever it picks: the same habits that stopped it at a red check would not have stopped `rm -r src`.

A habit is a request, and the model decides what counts as honouring it. Some things should not be up to the model at all. This explains why the next iteration puts a check in code, where no sentence can talk its way past it.

If `src/scratch.ts` or `scratch-note.txt` is still there, delete it. Then give the agent its first real job: see "The kata, part one" in the top-level README.
