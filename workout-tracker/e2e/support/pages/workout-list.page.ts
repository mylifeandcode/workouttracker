import type { Locator, Page } from '@playwright/test';

/**
 * The workout list at `/workouts` — an ng-zorro table with a name filter, a status column filter,
 * and Retire/Reactivate actions per row.
 */
export class WorkoutListPage {
  readonly heading: Locator;
  readonly addNewButton: Locator;
  readonly totalRecords: Locator;
  readonly nameFilterTrigger: Locator;
  readonly nameFilterInput: Locator;
  readonly resetButton: Locator;
  readonly statusFilterTrigger: Locator;
  readonly rows: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Workouts' });
    this.addNewButton = page.getByRole('button', { name: 'Add New' });
    this.totalRecords = page.getByText(/total workout\(s\)/);
    //Only the Name column has a filter trigger here, but scope it anyway so adding one to
    //another column later doesn't silently break this.
    this.nameFilterTrigger = page.getByRole('columnheader', { name: /^Name/ }).locator('nz-filter-trigger');
    this.nameFilterInput = page.getByPlaceholder('Workout Name');
    this.resetButton = page.getByRole('button', { name: 'Reset' });
    this.statusFilterTrigger = page.getByRole('columnheader', { name: /^Status/ }).locator('nz-filter-trigger');
    this.rows = page.locator('tbody tr');
  }

  async goto(): Promise<void> {
    await this.page.goto('/workouts');
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

  row(workoutName: string): Locator {
    return this.rows.filter({ hasText: workoutName });
  }

  workoutLink(workoutName: string): Locator {
    return this.page.getByRole('link', { name: workoutName, exact: true });
  }

  editLink(workoutName: string): Locator {
    return this.row(workoutName).locator('a[href*="/edit/"]');
  }

  statusCell(workoutName: string): Locator {
    return this.row(workoutName).locator('td').nth(2);
  }

  retireButton(workoutName: string): Locator {
    return this.row(workoutName).getByRole('button', { name: 'Retire' });
  }

  reactivateButton(workoutName: string): Locator {
    return this.row(workoutName).getByRole('button', { name: 'Reactivate' });
  }

  /**
   * Clears the Status column's "Active Only" filter, which is on by default — so a workout
   * disappears from the list the moment it is retired until this is turned off.
   */
  async includeRetiredWorkouts(): Promise<void> {
    await this.statusFilterTrigger.click();

    const dropdown = this.page.locator('.ant-table-filter-dropdown').filter({ hasText: 'Active Only' });
    await dropdown.getByText('Active Only').click();
    await dropdown.getByRole('button', { name: 'OK' }).click();
  }

  /** Pagination is server-side; the table only ever holds one page of rows. */
  pageButton(pageNumber: number): Locator {
    return this.page.locator('.ant-pagination-item').filter({ hasText: String(pageNumber) });
  }
}
