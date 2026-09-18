# Coding Agent Tutorial

Software engineers use coding agents daily. But do you actually know how they work under the hood? They're incredibly simple: you can build your own in just a few minutes.

## Setup

```sh
./setup
```

This checks you have Node.js 24+, npm and git, installs dependencies, and asks for your [OpenRouter](https://openrouter.ai/) API key. Paste it in and it writes it to `.env` (git-ignored), which `npm start` loads automatically.

Don't have a key yet?

1. Go to [openrouter.ai](https://openrouter.ai/) and sign in (GitHub and Google sign-in are supported).
2. Add credits at [openrouter.ai/credits](https://openrouter.ai/credits) — OpenRouter is usage-based, so you pay per token. The cheap default model (`deepseek/deepseek-v4-flash`) costs only a fraction of a cent for this tutorial.
3. Create a key at [openrouter.ai/keys](https://openrouter.ai/keys) and copy it (you'll only see it once), then run `./setup` and paste it in.

For a more capable model, change the model line in `.env`:
```sh
OPENROUTER_MODEL=anthropic/claude-sonnet-5
```

## Get started

Fire up your favourite coding agent, and say "coach me". It should walk you through the process of building your own coding agent, using the specs in [`docs/iterations`](docs/iterations) as guidance.

If you want the agent to do the work automatically instead, say "implement it". It should implement one iteration, commit it, show you what changed, give you an example to try, explain the remaining pressure test, then ask whether to continue.

## The finale

Once every iteration is `Done`, your agent can read, edit, and run commands, and it has a system prompt telling it to work carefully. This is where you find out whether that took. The rules are in [`kata/bowling/README.md`](kata/bowling/README.md). Start your agent with `npm start` and give it this:

```text
Read kata/bowling/README.md and build the bowling scorer test-first.
Run `npm run kata` to check your work.
```

Nothing in that says how to work. That comes from the system prompt you wrote in iteration 010. `npm run kata` runs that folder alone, with Node's built-in test runner, so nothing needs installing and a half-finished scorer never breaks anything else.

The folder holds one file; your agent has to make the rest. Watch what it does, and watch for the three ways it goes wrong: writing the code before the test, making a failing test pass by editing the test, and saying it is done without running anything. When it does one of those, the system prompt is the thing to change, not the code. You are not expected to finish. Three rules green, written test-first, is the exercise working.

## Credit

Inspired by [simple-agent-demo](https://github.com/SDiamante13/simple-agent-demo).

