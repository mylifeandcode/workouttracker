import type { Locator, Page } from '@playwright/test';

/**
 * The workout form, shared by `/workouts/new`, `/workouts/edit/:publicId` and
 * `/workouts/view/:publicId`.
 *
 * Exercises are added through a modal that hosts the mini exercise list; the exercise name field
 * on each row is readonly by design, so a row's identity comes from the modal selection.
 */
export class WorkoutEditPage {
  readonly name: Locator;
  readonly saveButton: Locator;
  readonly addExerciseButton: Locator;
  readonly editModeToggle: Locator;
  readonly errorMessage: Locator;
  readonly exerciseRows: Locator;

  constructor(private readonly page: Page) {
    this.name = page.locator('#workoutName');
    this.saveButton = page.getByRole('button', { name: 'Save', exact: true });
    this.addExerciseButton = page.getByRole('button', { name: 'Add Exercise to Workout' });
    this.editModeToggle = page.locator('#editModeToggle');
    this.errorMessage = page.locator('.error-text');
    this.exerciseRows = page.locator('.exerciseRow');
  }

  async gotoNew(): Promise<void> {
    await this.page.goto('/workouts/new');
  }

  async gotoEdit(publicId: string): Promise<void> {
    await this.page.goto(`/workouts/edit/${publicId}`);
  }

  async gotoView(publicId: string): Promise<void> {
    await this.page.goto(`/workouts/view/${publicId}`);
  }

  exerciseRow(index: number): Locator {
    return this.exerciseRows.nth(index);
  }

  exerciseName(index: number): Locator {
    return this.exerciseRow(index).locator('input.exerciseName');
  }

  numberOfSets(index: number): Locator {
    return this.exerciseRow(index).locator('input.number-of-sets');
  }

  setType(index: number): Locator {
    return this.exerciseRow(index).locator('select');
  }

  moveUpButton(index: number): Locator {
    return this.exerciseRow(index).getByRole('button').nth(0);
  }

  moveDownButton(index: number): Locator {
    return this.exerciseRow(index).getByRole('button').nth(1);
  }

  removeButton(index: number): Locator {
    return this.exerciseRow(index).getByRole('button').nth(2);
  }

  /** Opens the exercise modal and picks an exercise by name from the mini list. */
  async addExercise(exerciseName: string): Promise<void> {
    await this.addExerciseButton.click();

    const modal = this.page.locator('nz-modal-container');

    //The mini list pages at ten rows, so filter by name rather than hoping the exercise is on
    //page one. Its filter input is debounced, which Playwright's auto-waiting absorbs.
    await modal.locator('thead input[type="text"]').fill(exerciseName);

    await modal.getByRole('link', { name: exerciseName, exact: true }).click();

    //Selecting an exercise adds the row but leaves the modal open — addExercise() only updates
    //the model, and closeModal() is wired to nzOnCancel. Dismiss it before touching the form again.
    await this.page.locator('.ant-modal-close').click();
    await modal.waitFor({ state: 'detached' });
  }

  async save(): Promise<void> {
    await this.saveButton.click();
  }

  savedMessage(): Locator {
    return this.page.getByText(/Workout updated at/);
  }

  async enableEditing(): Promise<void> {
    await this.editModeToggle.click();
  }
}
