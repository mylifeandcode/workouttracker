---
applyTo: "src/app/**/*.ts,src/app/**/*.html"
---

# Forms And Guards Instructions

## Prefer Existing Form Style

- Use typed reactive forms throughout this repo. Prefer `FormGroup<...>`, `FormControl<T>`, `FormArray<FormGroup<...>>`, and `FormRecord<FormControl<boolean>>` rather than untyped forms.
- Prefer `FormBuilder` plus explicit generic form interfaces for non-trivial forms. Good reference points:
  - [src/app/exercises/exercise-edit/exercise-edit.component.ts](../../src/app/exercises/exercise-edit/exercise-edit.component.ts)
  - [src/app/workouts/workout-edit/workout-edit.component.ts](../../src/app/workouts/workout-edit/workout-edit.component.ts)
  - [src/app/workouts/workout-plan/workout-plan.component.ts](../../src/app/workouts/workout-plan/workout-plan.component.ts)
  - [src/app/user/user-settings/user-settings.component.ts](../../src/app/user/user-settings/user-settings.component.ts)
- When a control should never be `null`, use `{ nonNullable: true }` and type it accordingly.
- Use `signal(...)` for component state like loading, saving, error, and modal visibility instead of mixing in unrelated RxJS state containers.

## Match Existing Dynamic Form Patterns

- Use `FormArray` for ordered collections such as workout exercises, sets, or user rep settings.
- Use `FormRecord` when runtime keys are not known ahead of time, such as the target-area checkbox map in [src/app/exercises/exercise-edit/exercise-edit.component.ts](../../src/app/exercises/exercise-edit/exercise-edit.component.ts).
- Expose convenience getters like `exercisesArray` when templates need repeated access to nested arrays.
- Keep form creation in a dedicated method such as `createForm()` or `get...Form()` and patch or populate it from API data afterward.

## Unsaved Changes Pattern

- Routed components with editable state should typically extend [src/app/shared/components/check-for-unsaved-data.component.ts](../../src/app/shared/components/check-for-unsaved-data.component.ts) and implement `hasUnsavedData()` by checking the main form's `dirty` state.
- If the form is created asynchronously, make `hasUnsavedData()` null-safe and return `false` until the form exists. See [src/app/user/user-settings/user-settings.component.ts](../../src/app/user/user-settings/user-settings.component.ts).
- Routes for those components should use `canDeactivate: [UnsavedChangesGuard]` in the relevant `*.routes.ts` file.
- Do not add `UnsavedChangesGuard` to read-only, auth, or simple utility forms unless the user workflow actually needs navigation protection.

## Save Flow Expectations

- On successful save or completion flows, mark the form pristine so the unsaved-changes guard stops prompting unnecessarily.
- This repo commonly does that in `finalize(...)` around the save request. Keep that behavior aligned with actual success semantics.
- When a save creates a new entity and then navigates to an edit route, preserve the existing pattern of clearing dirty state before or during that transition.

## Validators And Cross-Field Rules

- Keep validators close to control creation. Use built-in validators first, then repo validators from [src/app/core/_validators/custom-validators.ts](../../src/app/core/_validators/custom-validators.ts) for cross-field or conditional rules.
- Existing forms use conditional validation for domain-specific cases such as timed sets and recommendation settings. Follow those patterns instead of introducing ad hoc template validation.
- Prefer updating validator behavior in typed form code over scattering validation logic through click handlers.

## Guard And Route Coordination

- When adding or changing an editable route, update both the component and its route definition together.
- Preserve `UserSelectedGuard`, `UserNotSelectedGuard`, and `UserIsAdminGuard` behavior when editing route files. Do not simplify guard combinations without understanding the login and user-selection flow.
- For edit screens that also have `view` routes, check whether the component infers read-only mode from `ActivatedRoute` or `Router.url` before renaming path segments.

## Testing Guidance

- Update or add focused component specs when changing form shape, validators, or route guard behavior.
- In this repo, specs often verify typed form setup directly through `component.form.controls...` and simulate route-bound inputs with `fixture.componentRef.setInput(...)` where applicable.
- Do not use `(component as any)` or similar casts in specs to read or write non-public component members. Prefer public methods, form controls that are already public, bound inputs, emitted events, or DOM interactions.
- Declare service mock variables using the concrete service type, not the mock class type. Provide mocks with `useClass` rather than `useValue`, and retrieve the instance with `TestBed.inject(ConcreteService)` after component creation. `useClass` produces a fresh mock instance per test, so cross-test `vi.clearAllMocks()` calls in `beforeEach` are not needed.
- If a component depends on `ActivatedRoute`, `Router.url`, or async form creation, mirror that setup in the test instead of assuming a synchronous form exists at construction time.