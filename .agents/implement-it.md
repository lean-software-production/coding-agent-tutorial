---
description: Implement the next Todo spec iteration and demo it
---
Implement the next Todo iteration from `docs/specs/README.md`, then explain and demo what changed before asking whether to continue.

This is guided autopilot. Do the implementation yourself, but walk the human through the build one iteration at a time. After each iteration, show what was learned, what changed, how to try it, and what limitation remains.

Follow this process exactly:

1. Read `docs/specs/README.md`.
2. Find the first ledger row whose status is exactly `Todo`.
3. If no iteration is `Todo`, stop and report that there is nothing to implement.
4. Read the spec linked from that row, including its `## Key concept`, `## Example`, and `## Pressure test` sections.
5. If the spec is unclear, stop and ask before editing.
6. Check the working tree and avoid touching unrelated user changes.
7. Check the current branch.
8. If the current branch is `main`, offer to create and switch to a dated solution branch named `solution/YYYY-MM-DD` before editing. If that branch already exists, suggest `solution/YYYY-MM-DD-2`, then `solution/YYYY-MM-DD-3`, and so on.
9. If the human says yes, create and switch to the branch. If they say no, continue on the current branch.
10. Change only that ledger row from `Todo` to `WIP` without committing it.
11. Implement only that spec. Do not start any later iteration.
12. Run the appropriate checks for this repo.
13. If checks fail and you cannot fix them within the spec, stop and report the failure.
14. Change the same ledger row from `WIP` to `Done`.
15. Review the diff and confirm that no other ledger rows changed.
16. Commit the implementation and ledger change with message `Implement iteration <number>`.
17. Report back with:
    - the iteration number and title
    - the key concept in plain language
    - a short summary of what changed
    - the spec's `## Example` as something the human can try
    - the spec's `## Pressure test` as the remaining shortcoming
18. Ask: "Ready for me to implement the next iteration?"
19. Stop and wait for the human's answer. If they say yes, repeat from step 1. If they say no, stop.

Rules:

- Implement one iteration per commit.
- Offer a solution branch before editing on `main`; do not create a branch without the human confirming.
- Pause after each iteration; do not automatically continue without the human confirming.
- Do not make a separate commit for the `WIP` ledger change.
- Do not commit unrelated existing changes.
- Keep each implementation scoped to its spec.
- Do not fix the spec's `## Pressure test`; use it to tee up the next iteration.
- Keep the code minimal and focused on the learning goal.
- Avoid defensive code and production hardening unless the spec asks for it.
