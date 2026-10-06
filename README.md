# Agent evaluation harness

Small TypeScript CLI. Load a YAML suite, call a mock or live agent adapter, score each case with a rubric, optionally compare golden files, and write JSON / JUnit reports.

## Why

Chat demos hide failures. Fixtures make expected behaviour explicit and repeatable in CI.

## Setup

```bash
npm install
npm test
```

## Sample run

```bash
npm run eval -- --suite suites/ops-triage.yaml --adapter mock
```

Scheduling suite:

```bash
npm run eval -- --suite suites/job-scheduling.yaml --adapter mock
```

With goldens and JUnit:

```bash
npm run eval -- \
  --suite suites/ops-triage.yaml \
  --adapter mock \
  --golden goldens/ops-triage \
  --junit reports/ops-triage.junit.xml
```

First time writing goldens:

```bash
npm run eval -- \
  --suite suites/ops-triage.yaml \
  --adapter mock \
  --golden goldens/ops-triage \
  --update-goldens
```

Optional live model (OpenAI-compatible):

```bash
export AGENT_API_KEY=...
# optional: AGENT_API_BASE=https://api.openai.com/v1
# optional: AGENT_MODEL=gpt-4o-mini
npm run eval -- --suite suites/ops-triage.yaml --adapter openai
```

## How to add cases

1. Add a case under `suites/` with `id`, `input`, and `rubric`
2. Rubric fields: `mustInclude`, `mustNotInclude`, `minLength`, `maxLength`, `jsonKeys`
3. Run the suite with the mock adapter
4. Commit new golden files if you use `--golden`

See [docs/architecture.md](docs/architecture.md).

## Licence

MIT
