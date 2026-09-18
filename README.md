# Coding Agent Tutorial

Software engineers use coding agents daily. But do you actually know how they work under the hood? They're incredibly simple: you can build your own in just a few minutes.

## Setup

Assume Node.js 24 or later is installed.

```sh
npm install
```

Set your [OpenRouter](https://openrouter.ai/) API key and model. OpenRouter exposes an OpenAI-compatible API at `https://openrouter.ai/api/v1`, so the standard `openai` npm package works — just point its `baseURL` at that endpoint. Model names are prefixed with the provider, e.g. `deepseek/deepseek-v4-flash`.

Copy the example env file and fill in your key:

```sh
cp .env.example .env
```

`.env` is git-ignored, and `npm start` loads it automatically using Node's built-in `--env-file-if-exists` flag, so no extra tooling is needed.

For a more capable model, change the model line in `.env`:
```sh
OPENROUTER_MODEL=anthropic/claude-sonnet-5
```

### Don't have an API key yet?

If `.env` doesn't exist yet, or still contains `your-key`, you need one:

1. Go to [openrouter.ai](https://openrouter.ai/) and sign in (GitHub and Google sign-in are supported).
2. Add credits at [openrouter.ai/credits](https://openrouter.ai/credits) — OpenRouter is usage-based, so you pay per token. The cheap default model (`deepseek/deepseek-v4-flash`) costs only a fraction of a cent for this tutorial.
3. Create a new API key at [openrouter.ai/keys](https://openrouter.ai/keys) and copy it (you'll only see the full key once).
4. Put it in `.env` so this project can find it:

   ```sh
   OPENROUTER_API_KEY=your-key
   ```

## Check you're ready

```sh
sh scripts/preflight.sh
```

This checks for Node.js 20+, npm, git, installed dependencies, and your API key, and tells you how to fix anything that's missing. It's plain shell so it works even before Node.js is installed.

## Get started

Fire up your favourite coding agent, and say "coach me". It should walk you through the process of building your own coding agent, using the specs in [`docs/iterations`](docs/iterations) as guidance.

If you want the agent to do the work automatically instead, say "implement it". It should implement one iteration, commit it, show you what changed, give you an example to try, explain the remaining pressure test, then ask whether to continue.

## Credit

Inspired by [simple-agent-demo](https://github.com/SDiamante13/simple-agent-demo).

