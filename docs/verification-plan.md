# CableMap: verification plan

No tests or evaluations have run. The following are prospective acceptance targets, not results.

## Fixtures and acceptance

15 development and 15 held-out hand-authored graphs, including occupied inputs, reversed direction, unknown adapters and disconnected sinks. Target all deterministic constraint tests passing, no unsupported compatibility assertions and exact exported edge/label fidelity. Three timed setup tasks should be compared with a plain hand-written patch list; report observations without claiming a user study if only the developer participates.

## Demonstration to verify

build a projector/audio chain, introduce an impossible link, inspect the reason, repair it, export the patch sheet and show the actual planning artifacts.

## Result record

For each run, record the source commit, fixture version, runtime/provider versions, actual pass and failure counts, latency, cost where relevant, and limitations. Keep development and held-out inputs separate. Report negative findings; freeze the protocol before inspecting held-out results.

A release requires a functioning end-to-end workflow and a clean-session replay. Documentation, repository creation and HTTP availability alone do not establish application correctness.
