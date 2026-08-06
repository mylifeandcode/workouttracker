import type { Locator, Page } from '@playwright/test';

/**
 * The username/password screen at `/login`. Only reachable as the default landing page when
 * config.json has loginWithUserSelect=false, but it is routable either way.
 */
export class LoginPage {
  readonly username: Locator;
  readonly password: Locator;
  readonly loginButton: Locator;
  readonly registerButton: Locator;
  readonly forgotPasswordLink: Locator;
  readonly loginFailedMessage: Locator;

  constructor(private readonly page: Page) {
    this.username = page.locator('#username');
    this.password = page.locator('#password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.registerButton = page.getByRole('button', { name: 'Register New User' });
    this.forgotPasswordLink = page.getByRole('link', { name: 'Forgot password?' });
    this.loginFailedMessage = page.getByText('Login failed.');
  }

  async goto(): Promise<void> {
    await this.page.goto('/login');
  }

  async logIn(username: string, password: string): Promise<void> {
    await this.username.fill(username);
    await this.password.fill(password);
    await this.loginButton.click();
  }
}
