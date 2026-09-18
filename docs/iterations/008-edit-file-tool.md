# Edit file tool

Let the agent change a file instead of telling you what to change.

## Key concept

A second tool is where dispatch appears. The model names the tool it wants; the program looks that name up and runs the matching function. Edits work by exact text replacement: the model quotes the text it wants gone and the text it wants instead, so a stale quote fails loudly rather than corrupting the file.

## Requirements

- Run it with `npm start`.
- Build on 007.
- Keep the `read_file` tool and the tool-call loop.
- Add an `edit_file` tool.
- The tool takes a relative `path`, an `old_text`, and a `new_text`.
- Only edit files inside this project.
- Replace exactly one occurrence of `old_text` with `new_text`.
- If `old_text` is not found, or is found more than once, return an error to the model as the tool result and leave the file alone.
- Dispatch on the tool name; do not assume every call is `read_file`.
- Print a trace before running each tool.

## Example

Make a file to edit:

```sh
echo 'title: old' > scratch-note.txt
```

Run `npm start`, then try:

```text
You: Change the title in scratch-note.txt to new.
Tool: read_file(scratch-note.txt)
Tool: edit_file(scratch-note.txt, title: old, title: new)
Assistant: Done. The title in scratch-note.txt is now "new".
```

`cat scratch-note.txt` to confirm. The model read the file first so it could quote the exact text to replace.

## Pressure test

Run `npm start`, then try:

```text
You: Rename the Tool: label in src/index.ts to Using:, and make sure it still compiles.
```

The agent reads and edits the file, then tells you to run `npx tsc --noEmit` yourself, or claims it compiles without checking. It can change your code but cannot run anything, so nothing it does is ever verified. This explains why the next iteration adds a shell tool.

Put the file back with `git checkout src/index.ts` and delete `scratch-note.txt`.
