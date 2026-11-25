import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import type { AddressInfo } from "node:net";

import { completionFor, statusFor, type Reply, type ToolCall } from "./model-script.ts";

export type Message = {
  readonly role: string;
  readonly content: string | null;
  readonly tool_call_id?: string;
  readonly tool_calls?: readonly { readonly id: string }[];
};

export type ModelRequest = {
  readonly apiKey: string | undefined;
  readonly model: string;
  readonly messages: readonly Message[];
  readonly tools?: readonly { readonly function: { readonly name: string } }[];
  readonly tool_choice?: string;
};

export type FakeModel = {
  readonly url: string;
  readonly requests: readonly ModelRequest[];
  close: () => Promise<void>;
};

export const toolNamesIn = (request: ModelRequest | undefined): string[] =>
  (request?.tools ?? []).map((tool) => tool.function.name);

export const canCallTools = (request: ModelRequest | undefined): boolean =>
  toolNamesIn(request).length > 0 && request?.tool_choice !== "none";

export const toolResultsIn = (request: ModelRequest | undefined): readonly Message[] =>
  (request?.messages ?? []).filter((message) => message.role === "tool");

export const resultOf = (call: ToolCall, request: ModelRequest | undefined): string =>
  String(toolResultsIn(request).find((message) => message.tool_call_id === call.id)?.content);

export function callsWithoutResults(request: ModelRequest | undefined): readonly string[] {
  const answered = toolResultsIn(request).map((message) => message.tool_call_id);
  const asked = (request?.messages ?? []).flatMap((message) => message.tool_calls ?? []).map((call) => call.id);

  return asked.filter((id) => !answered.includes(id));
}

export async function startFakeModel(replies: readonly Reply[]): Promise<FakeModel> {
  const requests: ModelRequest[] = [];
  const server = createServer((request, response) => {
    received(request)
      .then((asked) => {
        requests.push(asked);
        answer(response, replies[requests.length - 1], requests.length);
      })
      .catch(() => response.destroy());
  });
  const port = await listening(server);

  return { url: `http://127.0.0.1:${port}`, requests, close: () => closed(server) };
}

async function received(request: IncomingMessage): Promise<ModelRequest> {
  let body = "";
  request.setEncoding("utf8");
  for await (const chunk of request) body += String(chunk);

  return { ...JSON.parse(body), apiKey: request.headers.authorization?.replace("Bearer ", "") };
}

// Running past the script is loud, but not a 5xx: the SDK would retry that.
function answer(response: ServerResponse, reply: Reply | undefined, asked: number): void {
  const scripted = reply ?? { status: 400, error: `request ${asked} is past the end of the script` };

  response.writeHead(statusFor(scripted), { "content-type": "application/json" });
  response.end(completionFor(scripted));
}

function listening(server: Server): Promise<number> {
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve((server.address() as AddressInfo).port));
  });
}

function closed(server: Server): Promise<void> {
  return new Promise((resolve) => {
    server.close(() => resolve());
    server.closeAllConnections();
  });
}
