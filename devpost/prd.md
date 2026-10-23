---
doc: prd
status: draft
---

# CableMap — Product Requirements

Help a community presenter plan a small AV setup, understand a broken signal path, and print the connections they have reviewed. Source: `scope.md > The Unique Kernel`, `The Core Loop`, and the explicit scope approval of 20 October 2026.

The owner delegated the first-screen/layout decision to the agent on 23 October. The layout and implementation details below are agent decisions within that approved scope, not invented learner preferences. This is a saved review draft; delegation of a layout decision is not recorded as approval of an unseen PRD or specification.

## The Core Journey

1. Open CableMap without an account. Restore a valid saved project if one exists; otherwise show a clearly labeled presenter/projector/audio example and a Start blank action.
2. Add devices from the six-type catalog. Give each instance a recognizable label and inspect its declared ports.
3. Choose a source port and a destination port using labeled controls. The diagram and connection list show the same accepted cables.
4. Try an invalid connection. Its endpoints are highlighted and the inspector explains the exact direction, signal, connector, or occupied-port problem. Existing cables remain intact.
5. Correct the endpoints or explicitly disconnect an occupied cable. See whether the selected projector and speakers have a declared route back to a source.
6. Save locally, reload, and recover the same devices, labels, and connections. A clear saved/unsaved status explains what will survive.
7. Review and print a patch list with stable cable labels, endpoints, and unresolved-path warnings. Print output comes from the current graph.

Success means completing this whole loop, not merely drawing a visually connected graph. Compatibility describes the authored model; it is not a guarantee about physical equipment.

## Screens and Layout

One workspace, with no dashboard or onboarding wizard:

- **Top bar:** project name, saved/unsaved status, Save, Reload saved, Load example, Start blank, and Print patch list.
- **Left catalog:** six device types with short descriptions and Add buttons. Device instances have visible names and Rename/Remove actions.
- **Center:** an automatically arranged source-to-destination diagram, followed by a keyboard-accessible connection editor and cable list. The list is always available; dragging is not required.
- **Right inspector:** the selected device or connection, its declared properties, current validation feedback, and the action that can resolve an error.
- **Narrow screens:** catalog, editor/list, diagram, and inspector stack in reading order. Validation also appears next to the Connect controls so feedback does not require hunting elsewhere on the page.

Selecting a cable in either representation highlights the same cable and endpoints. A rejected attempt is a dashed preview labeled Rejected, separate from accepted connections and excluded from the patch list. Replacing saved or unsaved work requires a clear confirmation; cancel preserves the current graph.

## Look and Feel

Agent-selected under the owner's delegation: a light, practical AV worksheet with dark text, restrained blue accents, and clearly labeled ports. Green checks, amber warnings, and red errors always include words and symbols. Use a system sans-serif font, generous focus outlines, and compact cards with readable spacing. Keep connector names and cable identifiers easy to scan. No decorative animation, stock imagery, or extra product surfaces.

## Features and Behavior

### Six Declared Device Types

Use generic authored profiles for a presenter laptop, projector, USB audio interface, line mixer, powered speaker, and HDMI audio extractor. These names describe bounded planning examples, not verified commercial models. Each profile declares its input/output ports and internal signal routes. A user can label an instance; a custom label does not change its compatibility.

The audio interface and extractor are the only declared conversions. An arbitrary adapter or a matching-looking connector is never enough to claim compatibility. Keep the original exclusions in `scope.md > Explicitly Cut`.

### Build and Explain Connections

Each cable has one output and one input, with compatible declared signal and connector types. A physical port accepts one cable; no implicit splitters. Duplicate cables, self-connections, reversed directions, and unsupported conversions are rejected with an explanation. Occupied-port errors identify the existing cable and offer explicit removal rather than silently replacing it.

After every accepted change, derive connectivity through both cables and declared internal routes. A projector or speaker without a route from the laptop is marked Unresolved, even when its immediate cable is compatible. Unused optional input ports are not errors. Removing a device previews how many attached cables will be removed and requires confirmation.

### Keyboard Editing and Visual Feedback

Labeled native controls support adding, naming, connecting, selecting, disconnecting, and removing devices without a pointer. Tab order follows the task; focus remains meaningful after updates. Announce connection results in a status region. Do not use color or diagram position as the only explanation. The diagram supplements the complete text representation.

### Save and Reload Locally

Keep one named project in this browser. Save is explicit and only reports success after storage succeeds. Edits show Unsaved changes. Reload saved, Load example, and Start blank never silently discard edits. Browser refresh warns about unsaved work where supported; saving remains the reliable way to preserve it.

Validate saved data before loading. Invalid or newer-format data is not overwritten automatically. If browser storage is unavailable, keep the current in-memory project usable, show that saving failed, and retain Print. No account, cloud sync, or promise of cross-device recovery.

### Printable Patch List

Print a project title, device legend, numbered cables with both device/port labels, declared signal, and any unresolved sinks. Include the generic-profile/model limitation. Do not print rejected attempts or hidden editing controls. A disconnected graph can be printed, but must visibly say Unresolved rather than Ready. Printing does not mark the project saved or physically tested.

## States and Boundaries

- **First use:** clearly labeled example; Start blank is easy to find.
- **Empty:** short instruction to add a source and destination; no false success state.
- **Valid cable, incomplete path:** cable accepted; sink remains Unresolved with the missing upstream connection identified.
- **Rejected attempt:** reason and endpoints visible; accepted graph unchanged.
- **Saved/dirty/storage failure:** explicit status, with no silent loss or false success.
- **Limit reached:** bounded small graphs; explain the limit and preserve existing work.
- **Privacy:** graph data stays in the browser; no runtime telemetry, credentials, microphone access, or device scanning.

## Product Decisions

**Owner decisions already established:** six device types; accessible editing; compatibility and occupied-port validation; local save/reload; printable export; clear feedback; complete demonstration; no power/pin-level guidance or feature expansion. Public HTTPS delivery is required by the portfolio directive. The owner retains source publication, submission, and personally written learning content.

**Agent decisions under delegation:** the one-workspace layout, responsive stacking, visual style, exact six generic profiles, explicit saving, connection-preview behavior, and protective replacement confirmations. These decisions implement the approved scope and are not attributed to the learner.

## What We're Building

Acceptance is observable in a browser:

1. Build and save a laptop → projector path plus laptop → audio interface → mixer → speaker path.
2. Demonstrate reversed-direction, incompatible-signal, occupied-port, and unsupported-conversion attempts without changing valid cables.
3. Remove an upstream cable and observe the downstream sink become unresolved; restore it and recover the route.
4. Complete the same edit workflow with the keyboard and at a narrow viewport.
5. Reload a saved graph with identical identifiers, labels, devices, and edges; reject corrupt data without overwriting it.
6. Print exactly the reviewed cables, including unresolved warnings when applicable.
7. Repeat the core workflow at a verified public HTTPS URL, with accurate screenshots, setup instructions, and a concise demo script.

## Deferred and Non-Goals

No accounts, collaboration, cloud storage, runtime AI, commercial hardware database, arbitrary adapter authoring, freeform diagram editor, or automated hardware discovery. No soldering, mains/power, phantom-power, or pin-level advice. More device profiles and layout controls can follow only after the bounded release.

## Open Questions

There is no pending layout clarification. Public hosting must use authorized infrastructure without assuming an additional spending allowance; confirm the concrete static-hosting path at release. Formal review of this draft, actual hands-on feedback, and the owner's personal learning/submission content remain distinct evidence and must not be fabricated.
