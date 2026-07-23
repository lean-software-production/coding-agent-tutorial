# Coding Agent Tutorial

Software engineers use coding agents daily. But do you actually know how they work under the hood? They're incredibly simple: you can build your own in just a few minutes.

## Setup

Assume Node.js is installed.

```sh
npm install
```

Set your [OpenCode Zen](https://opencode.ai/) API key and model. OpenCode Zen exposes an OpenAI-compatible API at `https://opencode.ai/zen/v1`, so the standard `openai` npm package works — just point its `baseURL` at that endpoint.

```sh
export OPENCODE_API_KEY=your-key
export OPENCODE_BASE_URL='https://opencode.ai/zen/v1'
export OPENCODE_MODEL='deepseek-v4-flash'
```

For a more capable model:
```sh
export OPENCODE_MODEL='claude-sonnet-5'
```

(In the EnsembleWorks sandbox, `OPENCODE_API_KEY` is already set in the environment.)

### Don't have an API key yet?

If `OPENCODE_API_KEY` isn't set, you can check with:

```sh
echo "${OPENCODE_API_KEY:-not set}"
```

If it prints `not set`, register for one:

1. Go to [opencode.ai/zen](https://opencode.ai/zen) and sign in (GitHub sign-in is supported).
2. Add a payment method / credits — OpenCode Zen is usage-based, so you pay per token. The cheap default model (`deepseek-v4-flash`) costs only a fraction of a cent for this tutorial.
3. Create a new API key from the dashboard and copy it (you'll only see the full key once).
4. Export it in your shell so this project can find it:

   ```sh
   export OPENCODE_API_KEY='your-key'
   ```

   To persist it across shell sessions, add that line to your shell profile
   (e.g. `~/.bashrc` or `~/.zshrc`), or drop it into `.local/secrets.envrc`
   (already sourced by `.envrc` and git-ignored) if you use `direnv`.

## Get started

Fire up your favourite coding agent, and say "coach me". It should walk you through the process of building your own coding agent, using the specs in [`docs/specs`](docs/specs) as guidance.

If you want the agent to do the work automatically instead, say "implement it". It should implement one iteration, commit it, show you what changed, give you an example to try, explain the remaining pressure test, then ask whether to continue.

## Credit

Inspired by [simple-agent-demo](https://github.com/SDiamante13/simple-agent-demo).

