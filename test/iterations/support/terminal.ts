import type { ChildProcessWithoutNullStreams } from "node:child_process";
import type { Readable } from "node:stream";
import { stripVTControlCharacters } from "node:util";

const CTRL_C = "\u0003";
const PATIENCE_SECONDS = 20;

// Types at the agent the way a person would: only when it is waiting at an empty "You:".
export class Terminal {
  private raw = "";
  private reader = 0;
  private exit: { readonly code: number | null } | undefined;
  private readonly agent: ChildProcessWithoutNullStreams;

  constructor(agent: ChildProcessWithoutNullStreams) {
    this.agent = agent;
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
    await this.until("exit", () => this.exit !== undefined);

    return this.exit?.code ?? null;
  }

  private listenTo(stream: Readable): void {
    stream.setEncoding("utf8");
    stream.on("data", (text: string) => (this.raw += text));
  }

  // The echo of a typed prompt also contains "You:", so only an empty, waiting label counts.
  private async waitForPrompt(): Promise<boolean> {
    const waiting = () => /You:\s*$/.test(this.output.slice(this.reader));
    await this.until("show an empty You: prompt", () => this.exit !== undefined || waiting());

    return this.exit === undefined;
  }

  private async until(event: string, happened: () => boolean): Promise<void> {
    const deadline = Date.now() + PATIENCE_SECONDS * 1000;
    while (!happened() && Date.now() < deadline) await new Promise((resolve) => setTimeout(resolve, 25));
    if (!happened()) throw new Error(`The agent did not ${event} within ${PATIENCE_SECONDS} seconds:\n${this.output}`);
  }
}
