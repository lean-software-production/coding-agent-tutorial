import type { ChildProcessWithoutNullStreams } from "node:child_process";
import type { Readable } from "node:stream";
import { stripVTControlCharacters } from "node:util";

const CTRL_C = "\u0003";

// Types at the agent the way a person would: only when it is waiting at an empty "You:".
export class Terminal {
  private raw = "";
  private reader = 0;
  private exit: { readonly code: number | null } | undefined;
  private readonly agent: ChildProcessWithoutNullStreams;
  private readonly patienceMs: number;

  constructor(agent: ChildProcessWithoutNullStreams, patienceMs: number) {
    this.agent = agent;
    this.patienceMs = patienceMs;
    this.listenTo(agent.stdout);
    this.listenTo(agent.stderr);
    agent.stdin.on("error", () => {});
    agent.on("close", (code) => (this.exit = { code }));
  }

  get output(): string {
    return stripVTControlCharacters(this.raw);
  }

  async answer(prompt: string): Promise<void> {
    if (!(await this.waitForPrompt())) return;
    this.reader = this.output.length;
    this.agent.stdin.write(`${prompt}\n`);
  }

  async leave(): Promise<number | null> {
    if (await this.waitForPrompt()) this.agent.stdin.write(CTRL_C);
    await this.until(() => this.exit !== undefined);

    return this.exit?.code ?? null;
  }

  private listenTo(stream: Readable): void {
    stream.setEncoding("utf8");
    stream.on("data", (text: string) => (this.raw += text));
  }

  // The echo of a typed prompt also contains "You:", so only an empty, waiting label counts.
  private async waitForPrompt(): Promise<boolean> {
    const waiting = () => /You:\s*$/.test(this.output.slice(this.reader));
    await this.until(() => this.exit !== undefined || waiting());

    return this.exit === undefined && waiting();
  }

  private async until(done: () => boolean): Promise<void> {
    const deadline = Date.now() + this.patienceMs;
    while (!done() && Date.now() < deadline) await new Promise((resolve) => setTimeout(resolve, 25));
  }
}
