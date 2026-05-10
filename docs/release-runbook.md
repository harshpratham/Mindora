# Release and Go-Live Runbook

## Environments
- `dev`: local feature validation.
- `staging`: production-like validation and smoke tests.
- `prod`: customer-facing.

## Pre-Release Checklist
- CI green: lint, typecheck, test, build.
- Verify env values are set and non-demo.
- Confirm no seed endpoint/data seeding enabled in prod.
- Run smoke tests: auth, aptitude submit, resume save, job tracker.

## Deployment Steps
1. Deploy backend function changes to staging.
2. Run staging smoke tests.
3. Deploy frontend build to staging.
4. Promote backend and frontend to production in the same window.

## Backup and Recovery
- Daily DB backup with 14-day retention.
- Test restore once per month in staging.
- Keep last two successful frontend artifacts for instant rollback.

## Post-Release
- Monitor alerts for 30 minutes.
- Track conversion and error dashboards.
- Mark release as complete only after stability checks pass.
