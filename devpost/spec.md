---
doc: spec
status: draft
---

# CableMap — Technical Specification

Prepared alongside the PRD on 23 October 2026 from the approved scope and delegated routine design decisions. The owner then instructed continued implementation. The local application now implements this design; actual checks are recorded in docs/VERIFICATION.md. This remains a technical review draft, not a claim of formal learner approval or completed Skill Pack participation.

## How This Works, In Plain Language

The browser holds a small list of devices and cables. A fixed catalog explains what each port carries and which routes exist inside a device. Before adding a cable, a validator checks its two endpoints. A separate path check follows accepted cables and declared routes to explain whether the projector or speaker can receive a signal from the laptop.

The diagram, keyboard controls, saved project, and printed patch sheet all use that same graph. A failed connection is feedback, not a cable hidden in the saved data. Nothing needs an account or runtime AI service. A static host only serves application files; the user's diagram stays in their browser.

## The Core Journey Through the System

Implements `prd.md > The Core Journey`.

1. Startup reads and validates the saved snapshot; a clean browser receives the labeled example.
2. Add/Rename/Remove dispatch a graph change. Removal confirms affected cables before applying it.
3. Connect submits endpoint identifiers to the validator. A rejection produces a structured reason and highlighted endpoints; acceptance adds a stable cable ID.
4. A reachability pass derives sink warnings using fixed catalog routes. Diagram, list, and inspector render from the updated graph and derived findings.
5. Save validates and serializes the graph. Reload validates before replacing current state. Dirty state clears only on a successful save or confirmed load.
6. Print derives rows and warnings from the current graph, never a separate editable export model.

## Stack

- **TypeScript 5.9.3, browser ES modules, semantic HTML, CSS, and SVG.** Retain the existing portfolio choice; no frontend framework or graph dependency is necessary for six fixed profiles. Pin the compiler in the lockfile during the first working slice. [TypeScript configuration](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html).
- **Node.js 24 for development/build/test tooling**, matching the established local portfolio runtime. No Node process is required by the deployed static application.
- **Browser localStorage**, with validation and failure handling. Storage is origin-specific and may be unavailable; do not promise durable backup. [Storage behavior](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage).
- **Print CSS and the browser print dialog**, avoiding a PDF-generation dependency. [Print styling](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Media_queries/Printing).

These are agent implementation choices within the existing TypeScript/browser/local-persistence plan, not newly asserted learner preferences.

## Where It Runs and How Someone Tries It

Target a modern desktop or mobile browser, with no login, API key, database, or paid inference. Implemented local commands:

```text
npm ci
npm test
npm run build
npm start
```

The local preview binds to `127.0.0.1:8784`; open `http://127.0.0.1:8784`. The build, tests and preview were exercised locally. It serves compiled static files with a same-origin content security policy and no external fonts/scripts.

Public HTTPS is required by the owner's delivery plan. Prefer isolated static hosting within GCP project `tough-melody-508008-p8`; preserve every existing site/service. Do not create paid resources under the Amazon-only allowance. Determine the authorized static-hosting path and quota before publishing; keep runtime logic independent of the host. Source stays private until the owner explicitly authorizes this project's publication. The recorded event requirement for public GitHub and a demo remains an owner submission gate, not deployment authorization.

## Look and Feel

Implements `prd.md > Screens and Layout` and `Look and Feel`. Use CSS grid with a compact catalog, flexible center, and inspection panel. Below a content-driven breakpoint, stack in the documented reading order. Place native connection controls before the diagram on narrow screens. Use system fonts, neutral surfaces, blue actions, text-plus-icon validation, visible focus, and print-specific black-on-white output. Selection updates must not recreate the focused control unnecessarily.

## Components

### Catalog and Graph Model

Implements `prd.md > Six Declared Device Types`. Catalog version 1 defines fixed port IDs, direction, connector, signal, source/sink roles, and internal routes. Labels never alter these properties. Small-graph limits: 30 device instances, 60 cables, 80 characters per device/project label. These bounds protect responsiveness and storage validation; they do not expand catalog scope.

### Connection and Path Validator

Implements `prd.md > Build and Explain Connections`. Pure functions return reason codes and referenced device/port/cable IDs. Validate known endpoints, output-to-input direction, no self-link, exact declared signal/connector pairing, uniqueness, and one cable per port. No implicit splitter or conversion.

Build a directed port graph: cable edges output → input, plus catalog-defined internal input → output edges. Traverse from declared laptop outputs with a visited set. A required sink is resolved only if reachable; optional mixer inputs are not required sinks. Unknown catalog types, routes, or signals are invalid data, never assumed compatible. Cycle-safe traversal must terminate even on malformed imported data.

### Workspace and Accessible Editor

Implements `prd.md > Keyboard Editing and Visual Feedback`. Native buttons/selects and an ordered connection list drive all mutations. SVG is a derived view with deterministic source/intermediate/sink columns, not an independent store. The inspector names the exact failure and a possible correction; occupied-port actions require explicit disconnect. Use a polite status region for results and preserve logical focus after changes.

### Local Persistence

Implements `prd.md > Save and Reload Locally`. Store one versioned JSON snapshot under `cablemap.project.v1`. Parse into a new bounded structure, validate catalog references and every cable, then replace state. Do not trust saved arbitrary objects or merge them into prototypes. A rejected load leaves the current state and original stored bytes intact. Catch denied/quota errors and show Save failed. Dirty edits remain in memory. No automatic overwrite on first load, no cross-origin/cloud transfer, and no claim of multi-tab synchronization.

### Print View

Implements `prd.md > Printable Patch List`. Derive stable cable rows from the accepted graph, plus device legend and sink warnings. Insert labels as text, never HTML. Print CSS hides controls and includes unresolved status and model limitations. Print preparation is synchronous so the sheet matches the current review state. No rejected attempt enters saved/printed cables.

## Data Model

| Record | Required fields | Lifetime |
|---|---|---|
| Catalog profile | type, label, ports, internal routes, source/sink roles | Fixed application data |
| Port | id, direction, connector, signal | Fixed by profile; not user-editable |
| Device instance | id, type, label | Graph; saved locally |
| Cable | id, fromDevice, fromPort, toDevice, toPort | Accepted graph; saved locally |
| Project | schemaVersion, catalogVersion, title, devices, cables | In memory; explicit local save |
| UI state | selection, attempted endpoints, last result, dirty flag | Memory only |
| Findings | reason, affected IDs, unresolved sinks | Derived; recomputed, not trusted from storage |

Bounded authored profiles (not verified real products):

| Type | Declared ports | Internal behavior |
|---|---|---|
| Presenter laptop | HDMI AV out; USB-A audio-host out; 3.5 mm stereo-line out | Declared source outputs |
| Projector | HDMI AV in | Required video sink |
| USB audio interface | USB-B audio-device in; 3.5 mm stereo-line out | Declared USB audio → stereo-line route |
| Line mixer | Two 3.5 mm stereo-line inputs; one stereo-line output | Either input can supply output |
| Powered speaker | 3.5 mm stereo-line in | Required audio sink |
| HDMI audio extractor | HDMI AV in/out; 3.5 mm stereo-line out | Declared AV passthrough and stereo extraction |

Explicit cable pairings: HDMI output to HDMI input carrying AV; USB-A host output to USB-B device input carrying the modeled USB audio signal; 3.5 mm stereo-line output to matching input. No cable type performs conversion. The app makes no claim about arbitrary USB devices, actual adapter capabilities, negotiated HDMI formats, power, or physical equipment readiness.

## File Structure

Implemented application files; existing history and foundation documents are preserved:

```text
cablemap/
  devpost/{scope,prd,spec}.md       # Honest decision and review record
  src/catalog.ts                  # Six profiles and declared routes
  src/model.ts                    # Graph types and bounds
  src/validation.ts               # Connection rejection and reachability
  src/storage.ts                  # Versioned snapshot parsing/save/load
  src/print.ts                    # Derived patch rows and warnings
  src/app.ts                      # Events, state, DOM and SVG rendering
  public/{index.html,styles.css}  # Accessible shell and responsive/print CSS
  scripts/{build,serve}.mjs       # Static build and local preview
  tests/                         # Domain, corruption, export and browser checks
  docs/                          # Setup, verification evidence and release notes
  package.json / package-lock.json / tsconfig.json
```

## External Services and Dependencies

The runtime has no external API, credentials, analytics, or provider calls. Dependencies are development tools only and must be pinned/license-reviewed. A hosting origin serves the static artifact; application data is not uploaded. Hosting provider commands, live URL, quotas, costs, and deployment verification belong in the release record after the actual target is established. Do not label prepared deployment configuration as a live integration.

## Important Failure Modes

- **A plausible cable has no upstream signal:** validate route reachability as well as endpoints and show the unresolved sink.
- **Storage is denied, corrupt, or from a newer schema:** preserve current work, report the condition, and avoid an automatic overwrite. Print remains available.
- **An update or print diverges from the graph:** derive every view/export from the same state, test row/edge fidelity, and keep rejected attempts outside the graph.

## Verification and Recoverable Build Slices

1. A usable workspace can add devices, accept one valid cable, and explain an invalid one. Verify domain rules and the keyboard path; commit the working slice.
2. Complete internal route checks, explicit disconnect/removal, and local save/reload. Verify downstream warnings and corrupt/denied-storage recovery; commit.
3. Complete print fidelity, mobile layout, complete keyboard workflow, and the labeled demo. Exercise wrong direction, signal mismatch, occupation, unknown profiles/conversions, disconnected sinks, and special-character labels. Commit the complete local app.
4. Publish only through an authorized hosting path, verify public HTTPS in a clean browser, and save screenshots, commands, actual URL, and a demo script. Preserve owner-only feedback, publication, media, and submission gates separately.

The existing 15 development / 15 held-out graph and three timed-task targets remain unmeasured; keep held-out cases independent of implementation fixes. Record actual coverage and any deadline-driven reductions honestly. No real hardware test, accessibility audit, user study, or competition eligibility is inferred from unit tests.

## What Was Simplified and Why

Use fixed generic profiles and automatic diagram columns to concentrate on explainable validation. Use explicit single-browser saving and native printing to complete the demonstrated loop without accounts, backend storage, PDF libraries, or paid inference. These choices preserve the approved scope.

## Decisions and Open Issues

The owner approved the product boundary and delegated routine layout/design judgment; the agent selected the documented layout and technical details. No additional layout answer is needed. The draft has not been represented as learner-approved or as a completed Skill Pack stage. No personal learning intention or technical uncertainty was supplied; do not invent one. Hands-on review and personally authored reflection remain genuine owner evidence.

Public hosting access/quota and the actual deployed build remain release checks, not reasons to halt local development. Any new paid usage requires a separate allowance. No Devpost access or source publication is authorized by this document.
