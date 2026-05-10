# Incident Response Playbook

## Severity
- `SEV-1`: Full outage, login failure, data-loss risk.
- `SEV-2`: Partial outage, key journey blocked.
- `SEV-3`: Degraded experience with workaround.

## Immediate Steps
1. Acknowledge incident and assign incident commander.
2. Verify health endpoint and recent deploys.
3. Check logs by `requestId` and error spike.
4. Roll back latest release if regression is confirmed.

## Rollback Checklist
- Revert frontend to previous build artifact.
- Re-deploy previous Supabase function version.
- Validate `/health`, login, and one critical write flow.
- Post status update with ETA.

## Post-Incident
- Capture timeline and root cause.
- Add preventive action items.
- Add or update tests that could have prevented the issue.
