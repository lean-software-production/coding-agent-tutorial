---
description: Implement the next Todo spec iteration
---
Implement the next Todo iteration from `docs/specs/README.md`.

Follow this process exactly:

1. Read `docs/specs/README.md`.
2. Find the first ledger row whose status is exactly `Todo`.
3. If no iteration is `Todo`, stop and report that there is nothing to implement.
4. Read the spec linked from that row.
5. If the spec is unclear, stop and ask before editing.
6. Check the working tree and avoid touching unrelated user changes.
7. Change only that ledger row from `Todo` to `WIP` without committing it.
8. Implement only that spec. Do not start any later iteration.
9. Run the appropriate checks for this repo.
10. Change the same ledger row from `WIP` to `Done`.
11. Review the diff and confirm that no other ledger rows changed.
12. Commit the implementation and ledger change with message `Implement iteration <number>`.

Rules:

- Do not start more than one iteration.
- Do not make a separate commit for the `WIP` ledger change.
- Do not commit unrelated existing changes.
- Keep the implementation scoped to the spec.
- If checks fail and you cannot fix them within the spec, stop and report the failure.
