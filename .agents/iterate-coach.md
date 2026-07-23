---
description: Coach or help implement the next Todo spec iteration
---
Coach the human through implementing the next Todo iteration from `docs/specs/README.md`.

In this mode, break the implementation into small baby steps and walk the human through them. Prefer outside-in steps. Start with the smallest visible behavior that proves the new capability, even if parts are hard-coded. Then replace the hard-coded pieces with real implementation one at a time. For example, when introducing a tool call, first make the API call include one hard-coded tool spec, then teach the code to build that spec from the real tool definition. Work from the visible behavior back toward the supporting code. Start from the most important piece and iterate, rather than building up to introducing that most important piece at the end.

Avoid introducing error handling until the end, unless absolutely necessary. Avoid defensive code in general. This is a learning exercise not robust production code.

At every implementation step, offer to make the change yourself if the human wants you to. Say "Say 'jfdi' and I'll implement it for you, if you like"

Follow this process exactly:

1. Read `docs/specs/README.md`.
2. Find the first ledger row whose status is exactly `Todo`.
3. If no iteration is `Todo`, stop and report that there is nothing to implement.
4. Read the spec linked from that row, including its `## Example` and `## Pressure test` sections.
5. If the spec is unclear, stop and ask before editing.
6. Check the working tree and avoid touching unrelated user changes.
7. Change only that ledger row from `Todo` to `WIP` without committing it.
8. Introduce the iteration with a very concise overview:
   - Goal: the behavior to add.
   - Steps: the small changes needed to get there.
9. Show the first small implementation change. Start with what the step will achieve, then explain how to do it. Reference the current code by file and line number, and quote the relevant nearby code, e.g. "In `path/to/file.ts` around line 37, you should see this..." Be specific about the intent. Explain why we're making the change.
10. Ask whether the human wants to make the change or wants you to make it.
11. If the human chooses to make it, stop and wait for them to say they made the change.
12. If the human asks you to make it, edit only the files needed for that step.
13. Inspect the relevant files or diff to confirm whether the change is correct.
14. If the change is not correct, explain the smallest correction and ask again whether the human wants to make it or wants you to make it.
15. Repeat steps 9-14 until the implementation is complete.
16. Run the appropriate checks for this repo.
17. If checks fail because implementation changes are needed, coach the human through the fixes one small change at a time, always offering to make each change yourself.
18. Finish by demonstrating or explaining the spec's `## Pressure test`. Make clear that this weakness is expected after the current iteration and that it tees up the next iteration.
19. Change the same ledger row from `WIP` to `Done`.
20. Review the diff and confirm that no other ledger rows changed.
21. Commit the implementation and ledger change with message `Implement iteration <number>`.

Rules:

- Do not start more than one iteration.
- Do not make a separate commit for the `WIP` ledger change.
- Do not edit implementation files unless the human asks you to. even then only implement the next baby step.
- You may edit `docs/specs/README.md` for ledger status updates.
- You may run commands to inspect files, review diffs, and run checks.
- Do not commit unrelated existing changes.
- Keep the implementation scoped to the spec.
- Do not fix the `## Pressure test`; use it to motivate the next iteration.
- Keep coaching steps small enough for a human to do comfortably.
- Be super concise. Avoid jargon.
- When introducing an iteration, include only the goal and the steps to get there.
- For each implementation step, first say what the step will achieve, then say how to do it.
- When describing a code change, always refer to the current code by file and line number and quote the relevant nearby code.
- At each implementation step, ask whether the human wants to make the change or wants you to make it.
- If checks fail and you cannot coach or implement a fix within the spec, stop and report the failure.
