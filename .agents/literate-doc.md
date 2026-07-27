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
      <div class="key-concept">
        <h3>Key Concept</h3>
        <p>The spec's key concept, in plain language.</p>
      </div>
      <details class="detail">
        <summary>Code and demo</summary>
      <div class="split">
        <div class="code-panel">
          <div class="code-block">CODE LINES</div>
        </div>
        <div class="explanation-panel">
          <h3>What Changed from Iteration NNN-1</h3>
          <div class="note g1">
            <p><strong>Lines N–M: what they do</strong></p>
            <p>Why it matters.</p>
          </div>

          <h3>Setup</h3>
          <div class="note g4">
            <p><strong>Line N: what it does</strong></p>
            <p>One sentence. Boilerplate only.</p>
          </div>
        </div>
      </div>
      <div class="demo">
        <h3>What the agent can do now</h3>
        <p>One sentence naming the new capability this iteration unlocked.</p>
        <div class="transcript">CAPTURED OUTPUT</div>
      </div>
      <div class="pressure-test">
        <strong>Pressure Test:</strong> The spec's pressure test, and the iteration it motivates.
      </div>
      </details>
    </section>
```

The number, title and key concept stay outside the `<details>` so the page can be read as a list of lessons with everything collapsed. The code, the explanation, the demo and the pressure test all live inside it. Sections ship closed; do not add an `open` attribute.

The pressure test comes last, after the demo, and runs the full width — the reader should see what the agent can now do before reading what it still cannot.

For iteration 001 there is no previous iteration: use `<h3>Breaking Down the Code</h3>` instead of `<h3>What Changed from Iteration NNN-1</h3>` and walk through the whole listing.

Keep the source order shown above, with `code-panel` first. The shell's stylesheet puts the explanation on the left and the code on the right; swapping the markup would only undo that.

## Rendering the code listing

Every line of `src/index.ts` becomes one `<span class="code-line">`, starting with its line number:

```html
<span class="code-line"><span class="line-num">1</span><span class="keyword">import</span> <span class="variable">OpenAI</span> <span class="keyword">from</span> <span class="string">"openai"</span>;</span>
```

- Include a `code-line` span for blank lines too, so the numbering stays true to the file.
- Colour-code each explained run of lines. Give every line in the run a group class — `g1` through `g5` — alongside `code-line`, and put the same class on the `<div class="note">` that explains it. The code gets a margin rule, the note gets a matching bounding box:

  ```html
  <span class="code-line g1"><span class="line-num">19</span>…</span>
  ...
  <div class="note g1">
    <p><strong>Lines 19–22: the turn itself</strong></p>
    <p>Why it matters.</p>
  </div>
  ```

  Assign `g1` onward in the order the explanation presents the runs, so the iteration's lesson always gets `g1`. Leave blank separator lines between runs untagged. A section may explain at most five runs; if you need more, the explanation is too granular. Never invent a sixth group class or add colours of your own.
- A run's group class must cover exactly the lines its note names. If the note says `Lines 19–22`, lines 19, 20, 21 and 22 carry that class and no others do. A mismatch tells the reader to look in the wrong place.
- Escape `<`, `>`, and `&` as `&lt;`, `&gt;`, and `&amp;`.
- Highlight with the shell's classes: `keyword`, `string`, `comment`, `function`, `variable`, `operator`, `number`.
- Do not reformat, shorten, or elide the source. The listing must match the file exactly.

## Rendering the transcript

Show the whole terminal exchange, starting at the shell prompt that launched it and ending at the shell prompt it returns to, so the reader can see where the program begins and ends. Wrap the lines with the shell's transcript classes:

- `<span class="shell-line">` — terminal chrome: shell prompts and tool banners such as npm's. Dimmed, because it frames the run rather than being part of it.
- `<span class="prompt-line">` — lines the user typed.
- `<span class="reply-line">` — the agent's label lines.

Escape `>` in banner lines as `&gt;`.

## Rules

- Line numbers in the prose must match the line numbers in the listing beside it.
- Order the explanation by what it teaches, not by where it sits in the file. Lead with the lines that carry the iteration's lesson, and let the reader meet the idea first.
- Demote boilerplate — client construction, environment defaults, key checks — to a short `<h3>Setup</h3>` block at the end, one sentence each. It has to be present to run, but it is not what the reader came for. Drop the block entirely when there is nothing to demote.
- Explain why a change was made, not just what changed. The reader wants the reasoning.
- Keep each explanation short enough to read beside the code without scrolling past it.
- Do not document iterations that are `Todo` or `WIP`.
- Do not edit `src/index.ts`, the specs, or the ledger. This workflow only writes `docs/literate.html`.
- Do not solve a pressure test. It is the hook for the next iteration.
- Keep all styling in the shell's `<style>` block. Do not add inline styles or new CSS per section.
- The shell's closing `<script>` draws the curves joining each note to its run of code. It finds them by group class alone, so a correctly tagged section needs nothing else. Leave it in place and do not add scripts of your own.
