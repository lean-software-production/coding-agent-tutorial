# Build Your Own Coding Agent

Coding agents can read files, edit code, run commands, and decide what to do
next. They can seem complicated, but their core is surprisingly small.

An agent is a model plus a **harness**: the code that wraps the LLM, sends it
messages, runs the tools it asks for, and feeds the results back. Claude Code,
Codex, and Pi are harnesses. The code you write in this tutorial is a harness
too.

In this tutorial, you'll build one from scratch. You'll begin with a single
model request, turn it into an agent loop, add tools one at a time, and finish
by giving your agent a real coding task.

You can write each step yourself with an agent coaching you, or let the agent
implement each iteration and explain what changed.

## How the tutorial works

1. **[Set up your environment](#set-up-your-environment).** Use GitHub
   Codespaces, a local VS Code with a Dev Container, or your existing Node.js environment.
2. **[Choose your workflow](#choose-your-workflow).** Learn hands-on,
   or use guided autopilot.
3. **[Follow the iterations](#follow-the-iterations).** Build your agent one
   capability at a time, from a single model call to skills and subagents.
4. **[Put your agent to the test](#the-kata).** Give it a test-driven coding
   exercise, half way and again at the end, and see whether it follows the
   practices you taught it.

## Choose your workflow

Start your existing coding agent (eg: Codex, Claude Code, Pi) in this folder to act as your coach as you build your own coding agent:

| Say this | What happens | Best for |
|---|---|---|
| `coach me` | The agent teaches one small step at a time and lets you choose who writes the code. | Learning by doing |
| `implement it` | The agent implements one iteration, demonstrates it, and asks before continuing. | Guided autopilot |

Before you begin, make sure you have completed [set up your environment](#set-up-your-environment) by
running `bin/setup`. It checks your coding harness and the separate
OpenRouter API key used by the agent you build.

## Follow the iterations

The tutorial is split into fifteen small iterations. Each adds one visible
capability and ends with a pressure test that motivates the next step. Follow
your chosen workflow while the agent works through the specs in the
[`docs/iterations`](docs/iterations) ledger.

By iteration 010 your agent can hold a conversation, call multiple tools, read
and edit files, run commands, and follow a coding system prompt. The last five
give it a command guard, let it run in any folder, and teach it project
instructions, skills, and subagents.

Every iteration has an acceptance test. `npm test` runs them up to the
iteration you are on, and `npm test -- 004` stops after 004. They use a fake
model, so they need no key and cost nothing. A test that fails is telling you
what the spec still wants: change the code, not the test.

### Catching up

Each finished iteration is tagged on the `solution` branch. To continue from
one, commit your own work, then start a new branch at its tag. Your commits stay
on the branch you were on:

```sh
git add -A && git commit -m "My work so far"
git fetch --tags
git switch -c from-004 iteration-004-basic-read-file-tool
```

To read what an iteration changed, compare neighbours:

```sh
git diff iteration-003-stateful-agent-loop iteration-004-basic-read-file-tool
```

## The kata

Put your agent to work on the bowling kata. The rules are in
[`kata/bowling/README.md`](kata/bowling/README.md). `npm run kata` runs that
folder alone with Node's built-in test runner, so a half-finished scorer never
breaks anything else.

Watch for three ways it can go wrong: writing code before the test, making a
failing test pass by editing the test, or saying it is done without running
anything. When it does one of those, change the system prompt or the skill, not
the code. You are not expected to finish the whole kata.

### The kata, part one

After iteration 010, start your agent with `npm start`:

```text
Read kata/bowling/README.md and build the bowling scorer test-first, open frames and spares only. Put it in kata/bowling. Run npm run kata to check your work.
```

### The kata, part two

After iteration 015. Your agent needs the TDD skill from the 014 example, so
check that it starts with `Skills: 1` or more:

```text
Finish the bowling scorer in kata/bowling: add strikes and the tenth frame. Run npm run kata to check your work.
```

Did it work differently this time? Then have a subagent check the tests:

```text
Use a subagent to review the tests in kata/bowling against the rules in kata/bowling/README.md. Ask it which rules no test would catch if they broke. Change nothing.
```

---

## Set up your environment

Pick an environment, then run one setup command. It checks your coding harness
first, prepares the project, and configures the OpenRouter API key used by the
agent you will build.

The OpenRouter key is only for the agent you build in this tutorial. Your
coding harness (Pi, Claude Code, or Codex) signs in with its own account, as
usual.

Why a second account? Providers sell subscriptions for using their own
harnesses, but underneath, models are served over HTTP, even local ones. For
learning, it is better to call that API directly so you can see every request
and response your harness makes. OpenRouter puts many models behind one API,
so you can try different models in the harness you build by changing one line.

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
   OpenRouter charges by usage. For scale, having a coding agent build a
   simple working game of Tetris costs about US$3.50.
3. Create a key at [openrouter.ai/keys](https://openrouter.ai/keys) and copy it.
   You will only see it once. Run `bin/setup` and paste it when prompted.

#### Optional checks and configuration

Use `bin/setup --check` for the same readiness checks without installing
packages, prompting, or contacting OpenRouter. To require a particular harness,
add `--agent pi`, `--agent claude`, or `--agent codex`.

`bin/setup --live` sends one minimal request to the configured OpenRouter model.
It uses the network and may consume model quota; normal setup does not make a
model request when a key is already configured.

The tutorial defaults to `openai/gpt-6-luna`. To use a different model,
change the model line in `.env`, eg:

```sh
OPENROUTER_MODEL=z-ai/glm-5.3-flash
```

## Credit

Inspired by [simple-agent-demo](https://github.com/SDiamante13/simple-agent-demo).
