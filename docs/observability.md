# Observability and Alerts

## Logging Standard
- Include `requestId` in every API response and backend log entry.
- Use JSON logs with fields: `level`, `message`, `environment`, `requestId`, `path`, `userId` (when available).

## Metrics to Track
- API: request count, p95 latency, 4xx/5xx error rates, rate-limit rejects.
- Auth: sign-in success ratio, invalid token failures.
- Data: KV read/write failures, storage bucket failures.
- Product funnel: aptitude completion, resume analysis usage, counselor booking submissions.

## Alert Rules
- `5xx error rate > 3%` for 5 minutes.
- `p95 latency > 2s` for 10 minutes.
- `Auth failure spikes > 2x baseline`.
- `No successful requests for health endpoint in 2 minutes`.

## Dashboards
- Create one shared dashboard per environment: `dev`, `staging`, `prod`.
- Include panels for each metric group and link to runbook in `docs/incident-response.md`.
