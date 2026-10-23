# CableMap verification — 23 October 2026 IST

- `npm test`: TypeScript 5.9.3 build and **18 domain tests passed** on Node.js 24.8.0.
- `npm run test:browser`: **16 checks passed** in Chromium, including HTTP security headers, valid example, mismatched/reversed/occupied connections, rejected preview, downstream loss and repair, exact persistence, literal HTML-like labels, print invocation/rows/PDF, unresolved print warnings, replacement cancellation, corrupt storage, keyboard-only editing, 390px layout, browser isolation, and denied storage.
- No page or console errors recorded. Screenshots were visually inspected. A cable initially ran behind an unrelated card; routing was corrected and the browser workflow rechecked.
- Private GitHub visibility and ignored personal profile/local evidence were checked before commit.

Evidence is ignored locally: `.local/browser/verification.json`, `cablemap-workspace.png`, `cablemap-invalid-connection.png`, `cablemap-mobile.png`, `cablemap-patch-sheet.pdf`, and raw video under `.local/browser/video/`. Raw video is technical evidence, not the owner's final submission video. Initial isolated domain checks under `.local/domain-check` are superseded by the passing application test run, not counted twice.

## Public release

All sixteen browser checks also passed at https://cablemap-564976398462.web.app on23 October. The deployed app had no page or console errors. Public evidence is separate under `.local/live-browser/`: verification.json, screenshots, patch-sheet PDF, and raw video. This verifies actual hosted behavior, not a local mock.

Release: `projects/tough-melody-508008-p8/sites/cablemap-564976398462/channels/live/releases/1792748450251000`; finalized version `afb7a45630d24851`; provider release time `2026-10-23T09:40:50.251Z`. Release source `9a55a2b77b22f25ff28d69e06b99fea57cf1ee63`; application code milestone `9f181fcfae5a9398ad8329e4815541aa6595ccda`. Isolated static hosting; graph data remains in the browser.

Not yet established: real hardware compatibility; independent accessibility audit; the proposed 15+15 graph benchmark and three timed comparisons; actual learner hands-on feedback/learning; formal PRD/spec/checklist review; public source; final media or submission. Automated checks do not establish these results or completed Skill Pack participation.

Run `npm test` after domain changes and the browser verifier after workflow/layout/hosting changes. For a public release, set `CABLEMAP_BASE_URL` to the actual origin; its fresh-browser report is saved separately under `.local/live-browser/`.
