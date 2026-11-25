// Preloaded into the agent under test, so its model calls reach the fake model unchanged otherwise.
const realFetch = globalThis.fetch;

globalThis.fetch = async (input, init) => {
  const request = new Request(input, init);
  const { hostname, pathname } = new URL(request.url);
  if (hostname !== "openrouter.ai") return realFetch(request);

  return realFetch(process.env.FAKE_MODEL_URL + pathname, {
    method: request.method,
    headers: request.headers,
    body: await request.text(),
  });
};

// A pipe has no width, so a rule drawn to the terminal's edge would come out empty.
process.stdout.columns ??= 80;
