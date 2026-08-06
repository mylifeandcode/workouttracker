import type { Locator, Page } from '@playwright/test';

/**
 * The "Who are you?" screen at `/` and `/user-select`, shown when config.json has
 * loginWithUserSelect=true. Picking a user logs straight in with an empty password.
 */
export class UserSelectPage {
  readonly heading: Locator;
  readonly addUserButton: Locator;
  readonly errorMessage: Locator;
  readonly noUsersMessage: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Who are you?' });
    this.addUserButton = page.getByRole('button', { name: 'Add User' });
    this.errorMessage = page.getByRole('heading', { name: /An error occurred/ });
    this.noUsersMessage = page.getByText('No users have been created yet');
  }

  async goto(): Promise<void> {
    await this.page.goto('/user-select');
  }

  userButton(name: string): Locator {
    return this.page.getByRole('button', { name, exact: true });
  }

  /** Clicks a user, which logs in and navigates to /home. */
  async selectUser(name: string): Promise<void> {
    await this.userButton(name).click();
  }
}
