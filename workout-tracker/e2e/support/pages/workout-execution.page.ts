import type { Locator, Page } from '@playwright/test';

/** The 0-5 scale shared by the Form and Range of Motion dropdowns. */
export const RATING = {
  NA: '0',
  BAD: '1',
  POOR: '2',
  OK: '3',
  GOOD: '4',
  EXCELLENT: '5',
} as const;

export type Rating = typeof RATING[keyof typeof RATING];

/**
 * The workout execution screen at `/workouts/start/:executedWorkoutPublicId` — the app's core loop.
 *
 * Exercises live in an ng-zorro collapse, one panel each, whose header gains " (DONE)" once that
 * exercise's field tree is valid. Every set needs resistance, actual reps, and both ratings before
 * "Complete Workout" enables.
 */
export class WorkoutExecutionPage {
  readonly journal: Locator;
  readonly completeButton: Locator;
  readonly viewHistoryButton: Locator;
  readonly planNextButton: Locator;
  readonly startedText: Locator;
  readonly completedText: Locator;

  constructor(private readonly page: Page) {
    this.journal = page.locator('#journal');
    this.completeButton = page.getByRole('button', { name: 'Complete Workout' });
    this.viewHistoryButton = page.getByRole('button', { name: 'View Workout History' });
    this.planNextButton = page.getByRole('button', { name: 'Plan Next Workout' });
    this.startedText = page.getByText(/Workout started/);
    this.completedText = page.getByText(/, completed /);
  }

  heading(workoutName: string): Locator {
    return this.page.getByRole('heading', { name: workoutName, exact: true });
  }

  /** Collapse panel headers double as the per-exercise completion indicator. */
  exercisePanelHeader(exerciseName: string): Locator {
    return this.page.locator('.ant-collapse-header').filter({ hasText: exerciseName });
  }

  setRow(exerciseIndex: number, setIndex: number): Locator {
    return this.page.locator('wt-workout-exercise').nth(exerciseIndex).locator('.exercise-row').nth(setIndex);
  }

  /**
   * Fills one set. `targetReps` is normally pre-populated from the plan, so it's optional here —
   * pass it only when a test means to override what planning put there.
   */
  async fillSet(
    exerciseIndex: number,
    setIndex: number,
    values: { resistance: number; actualReps: number; formRating?: Rating; rangeOfMotionRating?: Rating; targetReps?: number }
  ): Promise<void> {
    const row = this.setRow(exerciseIndex, setIndex);

    await row.locator('input.resistance-amount').fill(String(values.resistance));

    if (values.targetReps !== undefined) {
      await row.locator('input.reps').nth(0).fill(String(values.targetReps));
    }

    await row.locator('input.reps').nth(1).fill(String(values.actualReps));
    await row.locator('select').nth(0).selectOption(values.formRating ?? RATING.GOOD);
    await row.locator('select').nth(1).selectOption(values.rangeOfMotionRating ?? RATING.GOOD);
  }

  async complete(): Promise<void> {
    await this.completeButton.click();
  }
}
