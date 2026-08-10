import type { Locator, Page } from '@playwright/test';

/**
 * The "Select a Workout to Start/Plan" screen at `/workouts/select` and `/workouts/select-for-later`.
 *
 * Choosing from the dropdown navigates immediately — there is no confirm button; the select's
 * change event routes straight to the planning screen.
 */
export class WorkoutSelectPage {
  readonly heading: Locator;
  readonly workoutSelect: Locator;
  readonly noWorkoutsMessage: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: /Select a Workout to/ });
    this.workoutSelect = page.locator('#selectedWorkout');
    this.noWorkoutsMessage = page.getByText(/haven't defined any workouts yet/);
  }

  async goto(): Promise<void> {
    await this.page.goto('/workouts/select');
  }

  async gotoForLater(): Promise<void> {
    await this.page.goto('/workouts/select-for-later');
  }

  /** Options are bound with [ngValue], so they must be picked by visible label, not value. */
  async selectWorkout(workoutName: string): Promise<void> {
    await this.workoutSelect.selectOption({ label: workoutName });
  }
}
