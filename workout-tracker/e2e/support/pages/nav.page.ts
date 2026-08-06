import type { Locator, Page } from '@playwright/test';

/**
 * The top navigation bar, which only renders its menus once a user is logged in.
 *
 * The menus are Bootstrap dropdowns, so an item has to be revealed by clicking its toggle
 * before it can be clicked — `navigateTo` does both.
 */
export class NavPage {
  readonly brand: Locator;
  readonly homeLink: Locator;
  readonly adminLink: Locator;
  readonly logOffLink: Locator;
  readonly userMenu: Locator;

  constructor(private readonly page: Page) {
    this.brand = page.getByRole('link', { name: 'Workout Tracker' });
    this.homeLink = page.getByRole('link', { name: 'Home', exact: false }).first();
    this.adminLink = page.getByRole('link', { name: 'Admin', exact: true });
    this.logOffLink = page.getByRole('link', { name: 'Log off' });
    this.userMenu = page.locator('#userDropdown');
  }

  /** The nav greets the logged-in user by name; absent entirely when logged out. */
  greeting(username: string): Locator {
    return this.page.getByText(`Welcome ${username}!`);
  }

  menu(name: 'Workouts' | 'Exercises' | 'Analytics'): Locator {
    return this.page.locator(`#${name.toLowerCase()}Dropdown`);
  }

  async openMenu(name: 'Workouts' | 'Exercises' | 'Analytics'): Promise<void> {
    await this.menu(name).click();
  }

  /** Opens the given menu and clicks one of its items, e.g. navigateTo('Exercises', 'Manage Exercises'). */
  async navigateTo(menu: 'Workouts' | 'Exercises' | 'Analytics', item: string): Promise<void> {
    await this.openMenu(menu);
    await this.page.getByRole('link', { name: item, exact: true }).click();
  }

  async openSettings(): Promise<void> {
    await this.userMenu.click();
    await this.page.getByRole('link', { name: 'Settings', exact: true }).click();
  }

  async logOff(): Promise<void> {
    await this.logOffLink.click();
  }
}
