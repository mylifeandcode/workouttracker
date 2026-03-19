---
agent: agent
description: Regenerate the OpenAPI client from the configured Swagger source, update related config when needed, and validate downstream consumers.
---

# Regenerate API Client

Use this prompt when working on changes related to the generated API client under [src/app/api](../../src/app/api) or its generator config in [openapi-ts.config.ts](../../openapi-ts.config.ts).

## Goals

- Determine whether the requested change belongs in generated output, generator config, or the backend OpenAPI source.
- Avoid hand-editing generated files unless the user explicitly asks for it or regeneration is impossible in the current environment.
- Regenerate the client with `npm run openapi-ts` when appropriate.
- Validate the smallest relevant downstream surface after regeneration.

## Workflow

1. Inspect the request and relevant files.
2. Check [openapi-ts.config.ts](../../openapi-ts.config.ts) and the generated-api instructions before making changes.
3. If the requested change should come from the backend OpenAPI schema rather than this repo, say so clearly before making local-only edits.
4. If a local config change is needed, update [openapi-ts.config.ts](../../openapi-ts.config.ts) first.
5. Run `npm run openapi-ts`.
6. Review the diff in [src/app/api](../../src/app/api) and any impacted hand-written consumers.
7. Validate with the smallest useful command, usually `npm run build` or a targeted test if a smaller validation is more appropriate.
8. Summarize what changed, what was regenerated, what was validated, and any remaining risks.

## Repo-Specific Rules

- Treat [src/app/api](../../src/app/api) as generated output.
- Do not rely on lint alone for generated client changes because [eslint.config.js](../../eslint.config.js) ignores `src/app/api/**`.
- The configured Swagger source is `http://localhost:5600/swagger/v1/swagger.json` unless [openapi-ts.config.ts](../../openapi-ts.config.ts) is changed.
- The regeneration command in this repo is `npm run openapi-ts`.
- Prefer imports from [src/app/api/index.ts](../../src/app/api/index.ts) over deep imports unless an existing local pattern intentionally differs.

## Failure Handling

- If the Swagger endpoint is unavailable, report that regeneration is blocked and explain whether you can still make a safe config-only or consumer-only change.
- If regeneration produces a broad diff, call out the most important contract changes instead of dumping the entire generated surface.
- If you must patch generated output temporarily, say that it will be overwritten on the next regeneration run and identify the real upstream fix location.

## Response Expectations

- Be explicit about whether the change was made in generator config, generated files, or hand-written consumers.
- Name the validation command you ran and the outcome.
- If no regeneration was performed, explain why.