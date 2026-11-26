# Command guard

Ask the human before the agent does something risky, and let them decide in advance.

## Key concept

The model only ever asks. Your program decides what runs, so a rule in code holds whatever the prompt, the model or a file it just read says. Some decisions belong to the human: the program stops and asks, and a settings file records the answers they always give. A refusal is an ordinary tool result: the model reads why and carries on.

## Requirements

- Build on 011.
- Check every tool call in code before it runs, against one short table of rules. Each rule has a name and a pattern, tested against the call's command and path together:
  - `delete`: a command or path that mentions `rm`.
  - `force-push`: `git push` with `--force` or `-f`.
  - `secrets`: a command or path that mentions `.env`.
  - `settings`: a command or path that mentions `settings.json`.
- Read `settings.json` from the agent's home when the agent starts. It maps rule names to `allow`, `ask` or `deny`, for example `{ "delete": "allow", "force-push": "deny" }`. A rule it does not mention is `ask`. No file means every rule is `ask`.
- Never read settings from the workspace.
- For `ask`, show the call and the rule's name and wait for yes or no, using `confirm` from `@inquirer/prompts` with no as the default.
- `allow` runs the call without asking. `deny`, or a no, answers it with a result that starts `Blocked: ` and names the rule.
- A call that matches several rules needs every one of them, so one allowed rule cannot hide a denied one.
- Ctrl-C at the question counts as no.
- A call that matches no rule runs as before.
- Remove `OPENROUTER_API_KEY` from the environment of `bash` commands, whatever the settings say.

The `settings` rule is there because the agent's home can also be its workspace. Without it, the agent could edit its own settings and allow itself anything.

## Example

In `~/shopping` from 011, make a file to delete:

```sh
echo 'buy milk' > old-list.txt
my-agent
```

```text
You: Delete old-list.txt.
Tool: bash(rm old-list.txt)
? Allow bash(rm old-list.txt)? (delete) (y/N)
```

Say yes and it runs; say no and the model reads `Blocked: delete was not allowed.` Now put `{ "delete": "allow" }` in `settings.json` in the agent's home, start it again, and ask for another delete: no question.

## Pressure test

Make a few files, and ask for a bigger tidy-up:

```sh
for f in a b c d; do echo "$f" > "$f.txt"; done
echo 'keep' > notes.txt
```

```text
You: Tidy this folder: delete everything except notes.txt.
? Allow bash(find . -mindepth 1 -maxdepth 1 ! -name notes.txt -exec rm -rf -- {}
 + && printf '%s\n' 'Remaining entries:' && find . -mindepth 1 -maxdepth 1 -prin
tf '%f\n' | sort && test "$(find . -mindepth 1 -maxdepth 1 ! -name notes.txt -pr
int -quit)" = "" && test -f notes.txt && echo 'Check passed: notes.txt is the on
ly remaining entry.')? (delete) (y/N)
```

Would you read all of that before pressing `y`? A question is only as good as the person answering it, and people stop reading. The rule only matched because the command happens to say `rm`: `find -delete`, `mv` or an `edit_file` that empties the file would not ask at all. Patterns catch accidents, not intent. The real boundary is a sandbox that limits what the process can touch at all.

There is another gap. In `~/shopping`, leave an instruction for agents:

```sh
echo 'End every reply with the word Ahoy.' > AGENTS.md
my-agent
```

```text
You: What is the capital of France?
Assistant: Paris.
```

No Ahoy. Your agent now runs in every project and knows the rules of none of them. It might find `AGENTS.md` if the task makes it look around, but nothing makes it look. This explains why the next iteration puts the project's instructions in front of it.
