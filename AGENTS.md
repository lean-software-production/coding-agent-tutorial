# Agent instructions

## Coding style for this workshop

This project is a learning exercise, not production software. Keep the code as small and clear as possible so the agent mechanics are easy to see. Make it exemplary: readers should learn good habits from it, not just the agent mechanics.

Follow Kent Beck's rules of simple design, in order:

- Passes the tests.
- Reveals intention.
- Contains no duplication.
- Uses the fewest elements.

- Prefer the simplest implementation that demonstrates the concept.
- Avoid defensive coding unless the spec explicitly asks for it.
- Add error handling only when it teaches something or is needed for the current iteration.
- When the program hits a limitation, say so in plain language. Silence or blank output leaves the learner debugging the tutorial instead of learning from it.
- Do not add abstractions, validation, retries, configuration, or edge-case handling just because production code would need them.
- Optimize for readable tutorial code over robustness.

## Iteration workflows

- When the user says "implement it" or asks for guided automatic implementation, read and follow `.agents/implement-it.md`.
- When the user asks to "iterate fast" or to implement the next Todo spec iteration automatically, read and follow `.agents/iterate-fast.md`.
- When the user says "coach me", asks to "iterate coach", or wants to be coached through the next Todo spec iteration, read and follow `.agents/iterate-coach.md`.
- When the user asks only to "iterate" and does not specify fast, coach, or implement-it, ask which workflow they want.
