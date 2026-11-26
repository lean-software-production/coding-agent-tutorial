import type { ChildProcessWithoutNullStreams } from "node:child_process";
import type { Readable } from "node:stream";
import { stripVTControlCharacters } from "node:util";

const CTRL_C = "\u0003";
const PATIENCE_SECONDS = 20;

export type Answer = "y" | "n";

// Types at the agent the way a person would: only when it is waiting at an empty "You:", or at a "(y/N)".
export class Terminal {
  questions = 0;
  private raw = "";
  private reader = 0;
  private exit: { readonly code: number | null } | undefined;
  private readonly agent: ChildProcessWithoutNullStreams;
  private readonly answers: Answer[];

  constructor(agent: ChildProcessWithoutNullStreams, answers: readonly Answer[]) {
    this.agent = agent;
    this.answers = [...answers];
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
    this.type(prompt);
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

  private type(line: string): void {
    this.reader = this.output.length;
    this.agent.stdin.write(`${line}\n`);
  }

  // A question nobody scripted gets the cautious answer.
  private answerQuestion(): void {
    if (!/\(y\/N\)\s*$/.test(this.output.slice(this.reader))) return;
    this.questions++;
    this.type(this.answers.shift() ?? "n");
  }

  // The echo of a typed prompt also contains "You:", so only an empty, waiting label counts.
  private async waitForPrompt(): Promise<boolean> {
    const waiting = () => /You:\s*$/.test(this.output.slice(this.reader));
    await this.until("show an empty You: prompt", () => this.exit !== undefined || waiting());

    return this.exit === undefined;
  }

  private async until(event: string, happened: () => boolean): Promise<void> {
    const deadline = Date.now() + PATIENCE_SECONDS * 1000;
    while (!happened() && Date.now() < deadline) {
      this.answerQuestion();
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
    if (!happened()) throw new Error(`The agent did not ${event} within ${PATIENCE_SECONDS} seconds:\n${this.output}`);
  }
}
