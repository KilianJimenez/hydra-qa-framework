import { Locator } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * SignUpPage — Page Object for the Sign Up screen.
 *
 * Selectors follow a priority strategy:
 *   1. data-testid attributes (most stable)
 *   2. ARIA roles + accessible names
 *   3. CSS selectors (last resort)
 */
export class SignUpPage extends BasePage {
  readonly path = '/signup';

  // ── Locators ──────────────────────────────────

  private get emailInput(): Locator {
    return this.page.getByTestId('signup-email');
  }

  private get passwordInput(): Locator {
    return this.page.getByTestId('signup-password');
  }

  private get confirmPasswordInput(): Locator {
    return this.page.getByTestId('signup-confirm-password');
  }

  private get submitButton(): Locator {
    return this.page.getByRole('button', { name: /sign up/i });
  }

  private get confirmationMessage(): Locator {
    return this.page.getByTestId('signup-confirmation');
  }

  private get errorMessage(): Locator {
    return this.page.getByTestId('signup-error');
  }

  // ── Actions ───────────────────────────────────

  async fillEmail(email: string): Promise<void> {
    await this.fill(this.emailInput, email);
  }

  async fillPassword(password: string): Promise<void> {
    await this.fill(this.passwordInput, password);
  }

  async fillConfirmPassword(password: string): Promise<void> {
    await this.fill(this.confirmPasswordInput, password);
  }

  async enterCredentials(email: string, password: string): Promise<void> {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.fillConfirmPassword(password);
  }

  async clickSignUp(): Promise<void> {
    await this.click(this.submitButton);
  }

  // ── Assertions ────────────────────────────────

  async expectConfirmationVisible(): Promise<void> {
    await this.expectVisible(this.confirmationMessage);
  }

  async expectErrorVisible(): Promise<void> {
    await this.expectVisible(this.errorMessage);
  }

  async getConfirmationText(): Promise<string> {
    return this.getText(this.confirmationMessage);
  }
}

