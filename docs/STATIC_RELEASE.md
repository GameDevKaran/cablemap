# CableMap static release

Status: **public and browser-verified** at https://cablemap-564976398462.web.app . The owner approved USD1 for CableMap through30 November2026 under `user-20261023-cablemap-firebase-usd1`. Source remains private. Only project `tough-melody-508008-p8` (number `564976398462`) and account `cgkaransahu@gmail.com` are authorized.

Actual release: version `afb7a45630d24851`, live release `1792748450251000`, provider time `2026-10-23T09:40:50.251Z`; source `9a55a2b77b22f25ff28d69e06b99fea57cf1ee63`. All16 public checks passed, including real browser persistence and print. `.local/firebase-release.json` preserves recovery metadata and source-file hashes; `.local/live-browser/` preserves live evidence. Do not redeploy or repeat passed checks without a change or concrete concern.

The first site-create attempt returned404 because the GCP project was not registered with Firebase. Adding Firebase to this exact existing project succeeded and provisioned its default empty Hosting site; only the separate CableMap site received application content. The dedicated site was then created and deployed successfully. No new GCP project, Cloud Run app, database, Auth instance or model service was created, and no older app was changed.

## Concrete deployment

- New dedicated Hosting site: `cablemap-564976398462`, subject to availability/ownership verification. Never deploy to the default site or an existing unrelated site.
- Artifact: the committed application built into `build/`, currently 9 files / 51,045 uncompressed bytes. No `.env`, repository history, learner profile, evidence videos, source maps, or Node dependencies are uploaded.
- `firebase.json` binds to the exact site and applies the verified same-origin content policy, MIME protection, permissions policy and short cache TTL.
- No Cloud Run, database, Auth, runtime identity, secrets, Cloud Build, model service, purchased domain or new GCP project. Graph data stays in each visitor's local browser storage.
- The read-only preflight found Firebase Hosting disabled. Hosting/Management APIs were then enabled successfully in the exact authorized project (operation `acat.p2-564976398462-5e03e463-a86e-4fa9-bc4c-332485828b8e`). An authenticated scoped REST listing returned no sites. No site, uploaded version, public release or billable application usage was created. The short-lived gcloud token stayed in memory; the explicit quota-project header was required.

After the allowance and site preflight, use the existing authorized authentication workflow, repeat the exact project flag, create only this site if absent, then publish only this hosting configuration. Preserve the immutable version/release ID and commit in ignored `.local/firebase-release.json`. Do not accept an existing site with unclear ownership. On interruption inspect the journal and actual version/release before retrying; no deletions of older apps or releases.

```text
firebase hosting:sites:list --project tough-melody-508008-p8 --account cgkaransahu@gmail.com --json --non-interactive
firebase hosting:sites:create cablemap-564976398462 --project tough-melody-508008-p8 --account cgkaransahu@gmail.com --non-interactive
firebase deploy --only hosting --project tough-melody-508008-p8 --account cgkaransahu@gmail.com --non-interactive
```

These are conditional release commands, not evidence they ran. If the CLI cannot reuse the account, the same scoped Hosting REST API can use the existing gcloud access token in process memory; never print/store the token or request another account unnecessarily. Validate project and site before any mutation.

## Cost and approval boundary

Request: **up to USD1 for CableMap only through 30 November 2026**. This is a spending allowance, not a guaranteed billing cap. Amazon's USD25 allowance does not cover this site.

Official Hosting pricing reviewed 23 October: no-cost storage up to10GB and transfer up to10GB/month, shared across the project; Blaze overage is USD0.026/GB storage and USD0.15/GB transfer. At 10,000 full uncached loads of this 51,045-byte artifact, transfer is about0.511GB; even if the shared transfer allowance were already used, that is about USD0.08 before taxes. Expected incremental cost under that traffic assumption is USD0–0.20; traffic and shared usage can vary. No zero-cost guarantee or hard cap is asserted. [Official usage and pricing](https://firebase.google.com/docs/hosting/usage-quotas-pricing).

The owner approved this exact allowance on23 October. It authorizes the isolated app deployment, not source publication or other projects. Do not change the project's billing plan, disable shared billing, or affect older apps to enforce this allowance.

## Live verification and rollback

Use the actual returned HTTPS origin, never assume the proposed hostname is working. Set `CABLEMAP_BASE_URL` and run `npm run test:browser`: fresh browser persistence, rejection/recovery, keyboard/mobile, exact printed rows, and security headers. Save `.local/live-browser/verification.json`, screenshots and raw video. Only then mark public/live verification true and update the owner's technical reference with the actual URL.

Rollback only this site's live channel to a recorded previous CableMap version. The first release has no previous application version; do not delete the site or disable another app without authorization. Preserve release artifacts through judging.
