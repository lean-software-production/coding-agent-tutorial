# Build Your Own Coding Agent

Coding agents can read files, edit code, run commands, and decide what to do
next. They can seem complicated, but their core is surprisingly small.

In this tutorial, you'll build one from scratch. You'll begin with a single
model request, turn it into an agent loop, add tools one at a time, and finish
by giving your agent a real coding task.

You can write each step yourself with an agent coaching you, or let the agent
implement each iteration and explain what changed.

## How the tutorial works

1. **[Set up your environment](#set-up-your-environment).** Use GitHub
   Codespaces, a local VS Code with a Dev Container, or your existing Node.js environment.
2. **[Choose your workflow](#choose-your-workflow).** Learn hands-on, use
   guided autopilot, or move through an iteration quickly.
3. **[Follow the iterations](#follow-the-iterations).** Build your agent one
   capability at a time, from a single model call to file editing and command
   execution.
4. **[Put your agent to the test](#the-finale).** Give the finished agent a
   test-driven coding exercise and see whether it follows the practices you
   taught it.

## Choose your workflow

Start your existing coding agent (eg: Codex, Claude Code, Pi) in this folder to act as your coach as you build your own coding agent:

| Say this | What happens | Best for |
|---|---|---|
| `coach me` | The agent teaches one small step at a time and lets you choose who writes the code. | Learning by doing |
| `implement it` | The agent implements one iteration, demonstrates it, and asks before continuing. | Guided autopilot |
| `iterate fast` | The agent implements and commits the next iteration, then stops. | Moving quickly |

Before you begin, make sure you have completed [set up your environment](#set-up-your-environment) by
running `bin/setup`. It checks your coding harness and the separate
OpenRouter API key used by the agent you build.

## Follow the iterations

The tutorial is split into ten small iterations. Each adds one visible
capability and ends with a pressure test that motivates the next step. Follow
your chosen workflow while the agent works through the specs in the
[`docs/iterations`](docs/iterations) ledger.

By the final iteration, your agent can hold a conversation, call multiple
tools, read and edit files, run commands, and follow a coding system prompt.

## The finale

Once every iteration is `Done`, find out whether your agent follows the coding
practices you taught it. The rules are in
[`kata/bowling/README.md`](kata/bowling/README.md).

Start your agent with `npm start` and give it this task:

```text
Read kata/bowling/README.md and build the bowling scorer test-first.
Run `npm run kata` to check your work.
```

Your coding agent should follow the system prompt you
wrote in iteration 010. `npm run kata` runs that folder alone with Node's
built-in test runner, so nothing needs installing and a half-finished scorer
never breaks anything else.

The folder holds one file; your agent has to make the rest. Watch for three
ways it can go wrong: writing code before the test, making a failing test pass
by editing the test, or saying it is done without running anything. When it
does one of those, change the system prompt, not the code.

You are not expected to finish the whole kata. Three rules green, written
test-first, means the exercise is working.

---

## Set up your environment

Pick an environment, then run one setup command. It checks your coding harness
first, prepares the project, and configures the OpenRouter API key used by the
agent you will build.

The OpenRouter key is only for the agent you build in this tutorial. Your
coding harness (Pi, Claude Code, or Codex) signs in with its own account, as
usual.

### Option 1: GitHub Codespaces

In GitHub, choose **Code → Create codespace on main**. The repository's Dev
Container includes Node.js 24, npm, git, Pi, Claude Code, and Codex.

### Option 2: Local Dev Container

Open this folder in VS Code and choose **Dev Containers: Reopen in Container**.
The container includes the same tools as the Codespaces environment.

The container also installs the optional [OpenAI Codex VS Code
extension](https://marketplace.visualstudio.com/items?itemName=openai.chatgpt)
in its remote extension host. No credentials are stored in the image or
repository.

### Option 3: Existing local environment

Install [Node.js 24 or later](https://nodejs.org/en/download), npm, git, and one
of the supported coding harnesses: Pi, Claude Code, or Codex. npm is included
with Node.js.

### Run setup

From the repository root, run:

```sh
bin/setup
```

The script walks through the requirements in order:

1. It checks that at least one coding harness is installed and authenticated.
2. It checks Node.js, npm, and git, then installs the project dependencies if
   needed.
3. It checks for `OPENROUTER_API_KEY`. If it is missing, the script asks for a
   key, verifies it with OpenRouter, and saves it in the git-ignored `.env`
   file.

If a harness needs authentication, the script shows the command to run. Follow
that instruction, then run `bin/setup` again.

When setup passes return to **[Choose your workflow](#choose-your-workflow).**

#### Don't have an API key yet?

1. Sign in at [openrouter.ai](https://openrouter.ai/). GitHub and Google sign-in
   are supported.
2. Add credits at [openrouter.ai/credits](https://openrouter.ai/credits).
   OpenRouter charges by usage.
3. Create a key at [openrouter.ai/keys](https://openrouter.ai/keys) and copy it.
   You will only see it once. Run `bin/setup` and paste it when prompted.

#### Optional checks and configuration

Use `bin/setup --check` for the same readiness checks without installing
packages, prompting, or contacting OpenRouter. To require a particular harness,
add `--agent pi`, `--agent claude`, or `--agent codex`.

`bin/setup --live` sends one minimal request to the configured OpenRouter model.
It uses the network and may consume model quota; normal setup does not make a
model request when a key is already configured.

The tutorial defaults to `openai/gpt-5.6-luna`. To use a different model,
change the model line in `.env`, eg:

```sh
OPENROUTER_MODEL=z-ai/glm-5.3-flash
```

## Credit

Inspired by [simple-agent-demo](https://github.com/SDiamante13/simple-agent-demo).
