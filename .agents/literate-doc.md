---
description: Update the literate walkthrough at docs/literate.html for the iterations built so far
---
Update `docs/literate.html`: a companion document that teaches the tutorial, iteration by iteration. Each section shows the lesson, the code that delivers it, a captured demo of what the agent can do now, and the shortcoming that motivates the next iteration.

The reader is someone learning how coding agents work. They should be able to read this document on its own, without the repo open, and understand both the concepts and the code.

## Where the content comes from

Never invent content. Every part of a section has a source:

| Part of the section | Source |
|---|---|
| Iteration number and title | The ledger row in `docs/specs/README.md` |
| Key concept | The spec's `## Key concept` |
| Code listing | `git show <commit>:src/index.ts` for that iteration's commit |
| What changed | `git diff <previous-commit> <commit> -- src/index.ts` |
| Demo transcript | A real run you captured (see below) |
| Pressure test | The spec's `## Pressure test` |

Find each iteration's commit with `git log --oneline --grep "Implement iteration <number>"`. If an iteration is `Done` in the ledger but has no such commit, use the working tree and say so in your report.

## Process

1. Read `docs/specs/README.md` and list every iteration whose status is `Done`.
2. If none are `Done`, stop and report that there is nothing to document yet.
3. If `docs/literate.html` does not exist, create it by copying `.agents/literate-shell.html`.
4. Read `docs/literate.html` and note which iterations already have a section.
5. For each `Done` iteration, in ascending order:
   - If it has no section, write one.
   - If it has a section, compare the rendered code listing against `git show <commit>:src/index.ts`. Rewrite the section only if the code or the spec has changed. Leave prose that is still accurate exactly as it is.
6. Insert new sections in ascending iteration order, immediately above the `<!-- ITERATIONS -->` marker comment, and keep that marker in place.
7. Rewrite the footer paragraph to name the highest documented iteration, keeping the `<!-- FOOTER -->` marker comment alongside the text so later runs can find it again.
8. Open the file in a browser or viewer and confirm it renders: no broken markup, both panels visible, line numbers aligned.
9. Report which sections you added, which you refreshed, and which you left untouched.

## Capturing the demo

Each section needs a real transcript, not a plausible one. For the iteration you are documenting:

1. Check out that iteration's code if you are not already on it, or use the working tree when documenting the newest iteration.
2. Run the spec's `## Example` against the agent, driving `npm start` with the example's prompt.
3. Capture the actual terminal output.
4. If the agent is interactive, pipe the prompt in rather than typing it, so the run is repeatable.
5. Trim the transcript to the exchange that demonstrates the lesson. Do not edit what the agent said.
6. If a run cannot be captured — a failing command, or `OPENCODE_API_KEY` not set — omit the demo block for that iteration and say so in your report. Never write a transcript you did not observe. If the key is missing, point the user at the "Don't have an API key yet?" section of `README.md`.

Model replies vary between runs. That is fine: the transcript is an example of what the agent could do, not a specification.

## Section template

```html
    <!-- Iteration NNN -->
    <section class="iteration">
      <div class="iteration-header">
        <span class="iteration-number">NNN</span>
        <span class="iteration-title">Title from the ledger</span>
      </div>
      <div class="split">
        <div class="code-panel">
          <div class="code-block">CODE LINES</div>
        </div>
        <div class="explanation-panel">
          <div class="key-concept">
            <h3>Key Concept</h3>
            <p>The spec's key concept, in plain language.</p>
          </div>

          <h3>What Changed from Iteration NNN-1</h3>
          <p><strong>Line N: what it does</strong></p>
          <p>Why it matters.</p>

          <div class="pressure-test">
            <strong>Pressure Test:</strong> The spec's pressure test, and the iteration it motivates.
          </div>
        </div>
      </div>
      <div class="demo">
        <h3>What the agent can do now</h3>
        <p>One sentence naming the new capability this iteration unlocked.</p>
        <div class="transcript">CAPTURED OUTPUT</div>
      </div>
    </section>
```

For iteration 001 there is no previous iteration: use `<h3>Breaking Down the Code</h3>` instead of `<h3>What Changed from Iteration NNN-1</h3>` and walk through the whole listing.

## Rendering the code listing

Every line of `src/index.ts` becomes one `<span class="code-line">`, starting with its line number:

```html
<span class="code-line"><span class="line-num">1</span><span class="keyword">import</span> <span class="variable">OpenAI</span> <span class="keyword">from</span> <span class="string">"openai"</span>;</span>
```

- Include a `code-line` span for blank lines too, so the numbering stays true to the file.
- Escape `<`, `>`, and `&` as `&lt;`, `&gt;`, and `&amp;`.
- Highlight with the shell's classes: `keyword`, `string`, `comment`, `function`, `variable`, `operator`, `number`.
- Do not reformat, shorten, or elide the source. The listing must match the file exactly.

In the transcript, wrap the user's lines in `<span class="prompt-line">` and the agent's label lines in `<span class="reply-line">`.

## Rules

- Line numbers in the prose must match the line numbers in the listing beside it.
- Explain why a change was made, not just what changed. The reader wants the reasoning.
- Keep each explanation short enough to read beside the code without scrolling past it.
- Do not document iterations that are `Todo` or `WIP`.
- Do not edit `src/index.ts`, the specs, or the ledger. This workflow only writes `docs/literate.html`.
- Do not solve a pressure test. It is the hook for the next iteration.
- Keep all styling in the shell's `<style>` block. Do not add inline styles or new CSS per section.
