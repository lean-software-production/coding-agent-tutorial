import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import path from "node:path";
import type { TestContext } from "node:test";
import { pathToFileURL } from "node:url";

import { startFakeModel, type ModelRequest } from "./fake-model.ts";
import type { Reply } from "./model-script.ts";
import { aSandbox, type Files, type Folder, type Sandbox } from "./sandbox.ts";
import { Terminal } from "./terminal.ts";

const preload = pathToFileURL(path.join(import.meta.dirname, "preload.mjs")).href;
const NOT_INHERITED = /^(OPENROUTER_.*|NODE_OPTIONS|NODE_TEST_CONTEXT|FORCE_COLOR|CI)$/;

export type Scenario = {
  readonly replies: readonly Reply[];
  readonly prompts: readonly string[];
  readonly files?: Files;
};

export type Outcome = {
  readonly output: string;
  readonly exitCode: number | null;
  readonly requests: readonly ModelRequest[];
  readonly project: Folder;
};

// Spawned rather than imported, so a test says nothing about how the agent is built.
export async function runAgent(t: TestContext, scenario: Scenario): Promise<Outcome> {
  const sandbox = await aSandbox();
  t.after(sandbox.remove);
  const model = await startFakeModel(scenario.replies);
  t.after(model.close);
  await sandbox.project.write(scenario.files ?? {});
  const agent = launch(sandbox, model.url);
  t.after(() => agent.kill("SIGKILL"));

  const terminal = new Terminal(agent);
  for (const prompt of scenario.prompts) await terminal.answer(prompt);
  const exitCode = await terminal.leave();

  return { output: terminal.output, exitCode, requests: model.requests, project: sandbox.project };
}

function launch({ project, userHome }: Sandbox, modelUrl: string): ChildProcessWithoutNullStreams {
  return spawn(process.execPath, ["--env-file-if-exists=.env", "src/index.ts"], {
    cwd: project.root,
    env: {
      ...inheritedEnvironment(),
      OPENROUTER_API_KEY: "test-key",
      OPENROUTER_MODEL: "fake/model",
      HOME: userHome,
      USERPROFILE: userHome,
      NODE_OPTIONS: `--import=${preload}`,
      FAKE_MODEL_URL: modelUrl,
      NO_COLOR: "1",
    },
  });
}

function inheritedEnvironment(): NodeJS.ProcessEnv {
  return Object.fromEntries(Object.entries(process.env).filter(([name]) => !NOT_INHERITED.test(name)));
}
