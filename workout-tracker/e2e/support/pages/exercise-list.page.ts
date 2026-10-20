import type { Locator, Page } from '@playwright/test';

/**
 * The exercise list at `/exercises` — an ng-zorro table with a name filter behind a search icon
 * and a target-area column filter.
 *
 * The table pages at 10 rows, and every exercise a run creates is permanent (the API has no
 * working delete), so tests should find their exercise with `searchByName` rather than assuming
 * it landed on the first page.
 */
export class ExerciseListPage {
  readonly heading: Locator;
  readonly addNewButton: Locator;
  readonly totalRecords: Locator;
  readonly nameFilterTrigger: Locator;
  readonly nameFilterInput: Locator;
  readonly resetButton: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Exercises' });
    this.addNewButton = page.getByRole('button', { name: 'Add New' });
    this.totalRecords = page.getByText(/total exercise\(s\)/);
    //Both the Name and Target Areas columns have a filter trigger, so this must be scoped.
    this.nameFilterTrigger = page.getByRole('columnheader', { name: /^Name/ }).locator('nz-filter-trigger');
    this.nameFilterInput = page.getByPlaceholder('Exercise Name');
    this.resetButton = page.getByRole('button', { name: 'Reset' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/exercises');
  }

  /**
   * Opens the name-filter dropdown and types the name. There is no Search button: the list searches by itself shortly
   * after typing stops (a 300 ms debounce), so wait for that request rather than clicking anything.
   */
  async searchByName(name: string): Promise<void> {
    await this.nameFilterTrigger.click();
    const searched = this.page.waitForResponse(response => response.url().includes('nameContains='));
    await this.nameFilterInput.fill(name);
    await searched;
  }

  row(exerciseName: string): Locator {
    return this.page.locator('tbody tr').filter({ hasText: exerciseName });
  }

  /** The exercise name itself, which links to the read-only view. */
  exerciseLink(exerciseName: string): Locator {
    return this.page.getByRole('link', { name: exerciseName, exact: true });
  }

  /** The pencil icon beside an exercise, which links to the edit form. */
  editLink(exerciseName: string): Locator {
    return this.row(exerciseName).locator('a[href*="/edit/"]');
  }

  targetAreasFor(exerciseName: string): Locator {
    return this.row(exerciseName).locator('td').nth(1);
  }
}
