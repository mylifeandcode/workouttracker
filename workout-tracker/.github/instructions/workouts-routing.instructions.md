---
applyTo: "src/app/workouts/**/*.ts,src/app/workouts/**/*.html,src/app/workouts/**/*.scss,src/app/app.routes.ts"
---

# Workouts Routing Instructions

## Keep Route Changes Local

- Put workouts route changes in [src/app/workouts/workouts.routes.ts](../../src/app/workouts/workouts.routes.ts). The top-level app router in [src/app/app.routes.ts](../../src/app/app.routes.ts) should continue lazy-loading the workouts feature through `loadChildren`.
- Preserve the existing standalone routing style: use `loadComponent(() => import(...).then(m => m.ComponentName))` rather than introducing NgModules.
- Keep the wildcard workouts route as the feature fallback to the workout list unless the feature flow is intentionally changing.

## Preserve Existing Flow Semantics

- These routes intentionally reuse components for different modes:
  - `new`, `edit/:id`, and `view/:id` all use `WorkoutEditComponent`
  - `plan/:id`, `plan-for-later/:id`, and `plan-for-past/:id/:start/:end` all use `WorkoutPlanComponent`
- Do not rename route params casually. Components depend on the current param names and path variants:
  - `start/:executedWorkoutPublicId` feeds `WorkoutComponent`
  - `edit/:id`, `view/:id`, and `history/view/:id` use `id`
  - `plan-for-past/:id/:start/:end` expects ISO-like date strings for start and end
- Several workouts components infer behavior from the current URL in addition to bound params. If you change path names such as `view`, `for-later`, or `for-past`, update the corresponding component logic and tests together.

## Guards And Unsaved Changes

- Most workouts routes require `UserSelectedGuard`. Preserve the existing guard intent unless a task explicitly changes access rules.
- Routes that host editable forms or in-progress workout state should keep `UnsavedChangesGuard` and continue using the `CheckForUnsavedDataComponent` pattern.
- Do not normalize the `in-progress` route without checking behavior first. It currently differs from the other workouts routes and that may be intentional.

## Component Conventions Tied To Routing

- Routed workouts components commonly use Angular `input()` bindings populated by `withComponentInputBinding()` from the app router configuration.
- Some of those same components also read `ActivatedRoute` or `Router.url` for mode detection. Examples:
  - [src/app/workouts/workout-edit/workout-edit.component.ts](../../src/app/workouts/workout-edit/workout-edit.component.ts) reads its `id` via `input()` but inspects the current URL to determine view mode.
  - [src/app/workouts/workout/workout.component.ts](../../src/app/workouts/workout/workout.component.ts) expects `executedWorkoutPublicId` from route input binding.
  - [src/app/workouts/workout-plan/workout-plan.component.ts](../../src/app/workouts/workout-plan/workout-plan.component.ts) reads route params directly and also checks whether the URL includes `for-later`.
- When adding a new routed workouts component, prefer this existing pattern over mixing in a new routing style.

## Feature Workflow Map

- Editing workout definitions lives under `new`, `edit/:id`, and `view/:id`.
- Planning and starting executions flows through `select`, `select-for-later`, `select-planned`, `plan...`, and `start/:executedWorkoutPublicId`.
- History and journaling live under `history`, `history/view/:id`, and `journal`.
- Past-workout logging begins at `log-past-start` and then continues through `plan-for-past/...`.

## When Testing Route Changes

- Update or add focused specs under `src/app/workouts/**` when route params, route names, or guard behavior changes.
- For components using router input binding, tests in this feature commonly simulate route-bound inputs with `fixture.componentRef.setInput(...)`.
- If a component still reads `ActivatedRoute` or `Router.url`, provide matching test setup for those dependencies instead of assuming `setInput(...)` is enough by itself.