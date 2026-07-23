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

## Get started

Fire up your favourite coding agent, and say "coach me". It should walk you through the process of building your own coding agent, using the specs in [`docs/specs`](docs/specs) as guidance.

If you want the agent to do the work automatically instead, say "implement it". It should implement one iteration, commit it, show you what changed, give you an example to try, explain the remaining pressure test, then ask whether to continue.

## Credit

Inspired by [simple-agent-demo](https://github.com/SDiamante13/simple-agent-demo).

