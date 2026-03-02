import { Page, Locator, expect } from '@playwright/test';

/**
 * BasePage — Foundation for all Page Objects.
 * Encapsulates common interactions with built-in retry logic,
 * waits, and structured logging.
 */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  /** The URL path this page represents (relative to baseUrl) */
  abstract readonly path: string;

  // ──────────────────────────────────────────────
  //  Navigation
  // ──────────────────────────────────────────────

  async navigate(baseUrl: string): Promise<void> {
    const url = `${baseUrl}${this.path}`;
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  // ──────────────────────────────────────────────
  //  Element Interactions (with built-in waits)
  // ──────────────────────────────────────────────

  protected async click(locator: Locator): Promise<void> {
    await locator.waitFor({ state: 'visible' });
    await locator.click();
  }

  protected async fill(locator: Locator, value: string): Promise<void> {
    await locator.waitFor({ state: 'visible' });
    await locator.clear();
    await locator.fill(value);
  }

  protected async selectOption(locator: Locator, value: string): Promise<void> {
    await locator.waitFor({ state: 'visible' });
    await locator.selectOption(value);
  }

  protected async getText(locator: Locator): Promise<string> {
    await locator.waitFor({ state: 'visible' });
    return (await locator.textContent()) ?? '';
  }

  protected async isVisible(locator: Locator, timeout = 5_000): Promise<boolean> {
    try {
      await locator.waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  // ──────────────────────────────────────────────
  //  Assertions (reusable)
  // ──────────────────────────────────────────────

  async expectVisible(locator: Locator): Promise<void> {
    await expect(locator).toBeVisible();
  }

  async expectText(locator: Locator, expected: string): Promise<void> {
    await expect(locator).toHaveText(expected);
  }

  async expectUrl(pattern: string | RegExp): Promise<void> {
    await expect(this.page).toHaveURL(pattern);
  }
}

