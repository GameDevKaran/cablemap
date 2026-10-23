---
doc: checklist
status: draft
---

# CableMap — recoverable build record

The owner explicitly delegated the layout decision and then instructed continued development on 23 October. Implementation proceeds under that instruction and the existing accelerated execution authorization. This record does not invent formal PRD/spec/checklist approval or learner hands-on feedback. Fast execution matches the owner's stated preference; mandatory personal review/learning evidence remains separately open.

## Slices

- [x] **1. Add devices, connect, and explain a rejected cable**
  - Becomes usable: One workspace can demonstrate the core signal-planning distinction.
  - Why now: Proves the unique validator and accessible editing before release work.
  - PRD ref: Six Declared Device Types; Build and Explain Connections; Keyboard Editing and Visual Feedback.
  - Spec ref: Catalog and Graph Model; Connection and Path Validator; Workspace and Accessible Editor.
  - Build: Fixed catalog, graph, native controls, diagram, selected explanation.
  - Verify (mechanical): TypeScript build, domain checks, browser valid/invalid connection workflow.
  - Learner check: Open the app, inspect the labeled example, reject a line-audio cable into the projector and inspect its reason.
  - Commit: feat: implement CableMap signal workspace and validation

- [x] **2. Preserve and print the reviewed plan**
  - Becomes usable: Saved graph reloads and prints the same accepted connections.
  - Why now: Completes the approved core journey and loss/error handling.
  - PRD ref: Save and Reload Locally; Printable Patch List; States and Boundaries.
  - Spec ref: Local Persistence; Print View; Important Failure Modes.
  - Build: Save/reload, replacement confirmation, corruption handling, printed patch sheet, narrow layout.
  - Verify (mechanical): Storage/print domain checks; browser reload, corrupt data, keyboard, narrow viewport and print fidelity.
  - Learner check: Change a label, save and reload, then inspect the print preview and report anything unclear.
  - Commit: test: verify complete CableMap local workflow and recovery

- [ ] **3. Publish and verify the public application**
  - Becomes usable: Owner and reviewers can try the app over HTTPS.
  - Why now: Local tests do not establish release readiness.
  - PRD ref: What We're Building.
  - Spec ref: Where It Runs and How Someone Tries It; External Services and Dependencies.
  - Build: Isolated authorized static hosting, security headers, reproducible release notes, accurate technical submission reference.
  - Verify (mechanical): Public HTTPS headers, clean-browser core journey, deployed persistence and print, screenshots.
  - Learner check: Try the public app and give actual final feedback before describing personal learning or readiness.
  - Commit: docs: record verified CableMap release and technical evidence

## Hands-on Checkpoints

Checked slices record mechanically verified implementation only, not learner feedback, formal approval, or completed participation. Eighteen domain and sixteen browser checks passed; see docs/VERIFICATION.md.

- [ ] Actual owner feedback on a usable core journey; not substituted by agent browser tests.
- [ ] Final owner review of the released workflow; report actual response and any resulting changes.

## Final Review

- [ ] Owner observations received and any agreed corrections verified.
- [ ] Owner explicitly confirms the proof of concept is ready.

## Code Tour and App Map

- [ ] Explain one actual connection from controls through validation to printed output with concrete code locations.
- [x] Save a compact app map; distinguish explanation supplied from learning personally reported.

Prepared reference: app-map.html maps the actual connection → validation → graph/print route at implementation commit9f181fc. It is an offline code reference, not evidence that the owner performed a walkthrough or reported learning. The hands-on/activity boxes remain unchecked.

## Revisions

- 23 October: layout question resolved by explicit delegation. Subsequent continue instruction authorizes implementation; draft review statuses remain truthful. No further routine layout/stack questions.
- 23 October: first two local slices completed together and verified as one recoverable milestone. Visual routing was corrected so a direct cable avoids an unrelated device card. No product scope change.
