# Coding Agent Tutorial

Software engineers use coding agents daily. But do you actually know how they work under the hood? They're incredibly simple: you can build your own in just a few minutes.

## Setup

Assume Node.js is installed.

```sh
npm install
```

Set your [OpenRouter](https://openrouter.ai/) API key and model. OpenRouter exposes an OpenAI-compatible API at `https://openrouter.ai/api/v1`, so the standard `openai` npm package works — just point its `baseURL` at that endpoint. Model names are prefixed with the provider, e.g. `deepseek/deepseek-v4-flash`.

```sh
export OPENROUTER_API_KEY=your-key
export OPENROUTER_BASE_URL='https://openrouter.ai/api/v1'
export OPENROUTER_MODEL='deepseek/deepseek-v4-flash'
```

For a more capable model:
```sh
export OPENROUTER_MODEL='anthropic/claude-sonnet-5'
```

### Don't have an API key yet?

If `OPENROUTER_API_KEY` isn't set, you can check with:

```sh
echo "${OPENROUTER_API_KEY:-not set}"
```

If it prints `not set`, register for one:

1. Go to [openrouter.ai](https://openrouter.ai/) and sign in (GitHub and Google sign-in are supported).
2. Add credits at [openrouter.ai/credits](https://openrouter.ai/credits) — OpenRouter is usage-based, so you pay per token. The cheap default model (`deepseek/deepseek-v4-flash`) costs only a fraction of a cent for this tutorial.
3. Create a new API key at [openrouter.ai/keys](https://openrouter.ai/keys) and copy it (you'll only see the full key once).
4. Export it in your shell so this project can find it:

   ```sh
   export OPENROUTER_API_KEY='your-key'
   ```

   To persist it across shell sessions, add that line to your shell profile
   (e.g. `~/.bashrc` or `~/.zshrc`), or drop it into `.local/secrets.envrc`
   (already sourced by `.envrc` and git-ignored) if you use `direnv`.

## Get started

Fire up your favourite coding agent, and say "coach me". It should walk you through the process of building your own coding agent, using the specs in [`docs/specs`](docs/specs) as guidance.

If you want the agent to do the work automatically instead, say "implement it". It should implement one iteration, commit it, show you what changed, give you an example to try, explain the remaining pressure test, then ask whether to continue.

## Credit

Inspired by [simple-agent-demo](https://github.com/SDiamante13/simple-agent-demo).

