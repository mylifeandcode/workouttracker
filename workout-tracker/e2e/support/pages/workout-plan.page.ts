import type { Locator, Page } from '@playwright/test';

/**
 * The workout planning screen (`/workouts/plan/:publicId` and its plan-for-later variant).
 *
 * Each exercise renders a "THIS TIME"/"NEXT TIME" card with a resistance amount and a target rep
 * count. Both are plain number inputs sharing the `.amount` class; the resistance one is
 * additionally marked `.trail-space`, which is the only thing distinguishing the two.
 */
export class WorkoutPlanPage {
  readonly heading: Locator;
  readonly startWorkoutButton: Locator;
  readonly savePlanButton: Locator;
  readonly neverDoneBefore: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Plan Your Workout' });
    this.startWorkoutButton = page.getByRole('button', { name: 'Start Workout' });
    this.savePlanButton = page.getByRole('button', { name: 'Save Workout Plan' });
    this.neverDoneBefore = page.getByText(/hasn't been done before/);
  }

  exerciseCard(index: number): Locator {
    return this.page.locator('wt-exercise-plan').nth(index);
  }

  /**
   * The editable "THIS TIME"/"NEXT TIME" panel. Scope to it rather than the whole card: the
   * card also renders read-only "Last Time" and "Suggestions" panels that repeat the same
   * labels and values, so unscoped text lookups match several elements.
   */
  nextTimeCard(index: number): Locator {
    return this.exerciseCard(index).locator('wt-exercise-plan-next-time');
  }

  resistanceAmount(index: number): Locator {
    return this.nextTimeCard(index).locator('input.amount.trail-space');
  }

  targetRepCount(index: number): Locator {
    return this.nextTimeCard(index).locator('input.amount:not(.trail-space)');
  }

  /** Shown in place of the resistance input for body-weight exercises. */
  bodyWeightLabel(index: number): Locator {
    return this.nextTimeCard(index).locator('.no-input-value');
  }

  /** Fills the plan for a single free-weight, rep-based exercise. */
  async planExercise(index: number, resistance: number, targetReps: number): Promise<void> {
    await this.resistanceAmount(index).fill(String(resistance));
    await this.targetRepCount(index).fill(String(targetReps));
  }

  async startWorkout(): Promise<void> {
    await this.startWorkoutButton.click();
  }
}
