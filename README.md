# CableMap

Validate small AV signal graphs and export patch lists.

## Status

This repository contains the initial product documentation. Application development has not started. There is no runnable application, measured benchmark or deployed service yet.

## Intended use

A community presenter setting up a small AV desk needs a correct signal path before the event. CableMap lets them place known devices, connect declared ports and discover double-booked inputs, incompatible signal types or missing adapters, then print a readable patch list. It models low-voltage audio/video signal compatibility; it does not design mains wiring.

## Planned workflow

Select devices from a small authored catalog → connect input/output ports → validate graph constraints → inspect an error path → change a cable/adapter → export patch sheet and labels. Use TypeScript, an in-browser graph model and local persistence; no paid runtime AI or account is necessary. AI-assisted development through the official Skill Pack is the event integration.

## Development

Start with the behavior and boundaries in [Architecture](docs/architecture.md), then establish the fixtures and acceptance checks in [Verification plan](docs/verification-plan.md). Runtime versions, dependency installation, commands and deployment instructions will be added alongside working code. No installation command is available at this stage.

Keep credentials in local ignored files or the deployment secret store. Do not commit user data, provider tokens or private evaluation records.

## License

Original application code and these documents use the [MIT license](LICENSE). Future dependencies, models, datasets and media retain their own licenses and must be reviewed before inclusion.
