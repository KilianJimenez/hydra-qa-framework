import { BaseScreen } from './base.screen';

/**
 * SignUpScreen — Screen Object for the mobile Sign Up screen.
 *
 * Uses cross-platform selectors via byId() and byAccessibilityId()
 * to support both Android and iOS from a single class.
 */
export class SignUpScreen extends BaseScreen {
  // ── Selectors ─────────────────────────────────

  private get emailField(): string {
    return this.byId('com.hydraqa.app:id/signup_email', 'signup-email');
  }

  private get passwordField(): string {
    return this.byId('com.hydraqa.app:id/signup_password', 'signup-password');
  }

  private get confirmPasswordField(): string {
    return this.byId('com.hydraqa.app:id/signup_confirm_password', 'signup-confirm-password');
  }

  private get signUpButton(): string {
    return this.byAccessibilityId('signup-submit');
  }

  private get confirmationMessage(): string {
    return this.byAccessibilityId('signup-confirmation');
  }

  private get errorMessage(): string {
    return this.byAccessibilityId('signup-error');
  }

  // ── Screen Load ───────────────────────────────

  async waitForScreenLoaded(): Promise<void> {
    await this.waitForElement(this.emailField);
  }

  // ── Actions ───────────────────────────────────

  async enterEmail(email: string): Promise<void> {
    await this.typeText(this.emailField, email);
  }

  async enterPassword(password: string): Promise<void> {
    await this.typeText(this.passwordField, password);
  }

  async enterConfirmPassword(password: string): Promise<void> {
    await this.typeText(this.confirmPasswordField, password);
  }

  async enterCredentials(email: string, password: string): Promise<void> {
    await this.enterEmail(email);
    await this.enterPassword(password);
    await this.enterConfirmPassword(password);
  }

  async tapSignUp(): Promise<void> {
    await this.tap(this.signUpButton);
  }

  // ── Assertions ────────────────────────────────

  async isConfirmationDisplayed(): Promise<boolean> {
    return this.isDisplayed(this.confirmationMessage);
  }

  async isErrorDisplayed(): Promise<boolean> {
    return this.isDisplayed(this.errorMessage);
  }

  async getConfirmationText(): Promise<string> {
    return this.getText(this.confirmationMessage);
  }
}

