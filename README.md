# CableMap

Validate small AV signal graphs and export patch lists.

## Status

**Live:** https://cablemap-564976398462.web.app

The application validates declared AV connections, explains upstream gaps, saves/reloads locally, and prints the reviewed patch list. Eighteen domain tests, sixteen local browser checks, and the same sixteen checks against the public HTTPS deployment pass. Generic profiles are an authored planning model, not tested commercial hardware specifications.

The scope is owner-approved. The owner delegated routine layout decisions and instructed continued implementation. [Product requirements](devpost/prd.md), [technical specification](devpost/spec.md), and [build record](devpost/checklist.md) preserve that provenance; formal learner review and personal reflection are not fabricated.

## Intended use

A community presenter setting up a small AV desk needs a correct signal path before the event. CableMap lets them place known devices, connect declared ports and discover double-booked inputs, incompatible signal types or missing adapters, then print a readable patch list. It models low-voltage audio/video signal compatibility; it does not design mains wiring.

## Workflow

Select devices from a small authored catalog → connect input/output ports → validate graph constraints → inspect an error path → change a cable/adapter → export patch sheet and labels. Use TypeScript, an in-browser graph model and local persistence; no paid runtime AI or account is necessary. AI-assisted development through the official Skill Pack is the event integration.

## Development

Requires Node.js 24 and npm. No API keys or environment file is needed.

```sh
npm ci
npm test
npm run build
npm start
```

Open http://127.0.0.1:8784. The preview binds only to localhost by default. `build/` is the static deployment artifact; no runtime backend, model service, or cloud data storage is required.

For browser verification, install Chromium once with `npx playwright install chromium`, then run `npm run test:browser`. The existing local Chromium installation was used for this milestone. The script starts/stops its own preview and writes screenshots, a patch-sheet PDF, raw video, and a JSON report under ignored `.local/browser/`. It supports `CABLEMAP_BASE_URL` for later public verification.

See the [verification record](docs/VERIFICATION.md) for actual evidence and unperformed checks.

## Data and safety boundaries

Save is explicit. The single saved project lives under `cablemap.project.v1` in browser localStorage; clearing site data removes it. Changes remain unsaved until Save succeeds. Invalid snapshots are rejected without overwriting stored bytes. Print a copy for a portable record. No account, telemetry, microphone access, uploaded code, or hardware discovery is used.

User labels render as text. Static responses use a same-origin content policy, MIME protection, and disabled camera/microphone/geolocation. No power, mains, soldering, phantom-power, or pin-level guidance is provided. This source repository stays private until owner authorization.

Keep credentials in local ignored files or the deployment secret store. Do not commit user data, provider tokens or private evaluation records.

## License

Original application code and these documents use the [MIT license](LICENSE). Future dependencies, models, datasets and media retain their own licenses and must be reviewed before inclusion.
