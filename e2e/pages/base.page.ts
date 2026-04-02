import { Page, expect } from '@playwright/test';

/**
 * Base page class that all page objects must extend.
 * Provides common navigation and verification methods.
 */
export abstract class BasePage {
  protected readonly page: Page;
  protected abstract readonly url: string;

  constructor(page: Page) {
    this.page = page;
  }

  async navigate(): Promise<void> {
    await this.page.goto(this.url);
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }

  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  async expectToBeVisible(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(this.url));
  }
}
