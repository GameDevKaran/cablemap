# CableMap: architecture

The original outline below is implemented by the local application as of 23 October. Current component contracts and actual verification are in [the specification](../devpost/spec.md) and [verification record](VERIFICATION.md). Public deployment remains a separate release gate.

Select devices from a small authored catalog → connect input/output ports → validate graph constraints → inspect an error path → change a cable/adapter → export patch sheet and labels. Use TypeScript, an in-browser graph model and local persistence; no paid runtime AI or account is necessary. AI-assisted development through the official Skill Pack is the event integration.

Catalog scope: six device types and a limited HDMI/USB/audio signal vocabulary. User-entered metadata is explicitly unverified. Exclude soldering, pin-level electrical advice, power capacity, phantom power, automatic hardware discovery and arbitrary adapters. Deterministic checks must not declare an unknown conversion compatible. A keyboard-accessible list editor is required alongside the visual graph.

## Failure handling and data boundaries

Preserve original inputs and make unavailable evidence explicit. Provider failures must return a visible unresolved state. Decisions that change user or provider state need the confirmation specified above. Record source versions and operation identifiers without exposing credentials.

## Implementation record

Add pinned dependencies, actual component boundaries and operational instructions when the first working slice exists. Document departures from this design with their reason; do not describe planned integrations as verified.
