/**
 * BaseScreen — Foundation for all mobile Screen Objects.
 * Encapsulates cross-platform element interactions with retry and wait logic.
 *
 * Uses the Screen Object Model (SOM) pattern — the mobile equivalent
 * of Page Object Model (POM), adapted for native app contexts.
 */
export abstract class BaseScreen {
  /**
   * Wait for the screen's key element to be displayed,
   * confirming the screen has loaded.
   */
  abstract waitForScreenLoaded(): Promise<void>;

  // ──────────────────────────────────────────────
  //  Element Interactions
  // ──────────────────────────────────────────────

  protected async tap(selector: string): Promise<void> {
    const element = await $(selector);
    await element.waitForDisplayed({ timeout: 15_000 });
    await element.click();
  }

  protected async typeText(selector: string, value: string): Promise<void> {
    const element = await $(selector);
    await element.waitForDisplayed({ timeout: 15_000 });
    await element.clearValue();
    await element.setValue(value);
  }

  protected async getText(selector: string): Promise<string> {
    const element = await $(selector);
    await element.waitForDisplayed({ timeout: 15_000 });
    return element.getText();
  }

  protected async isDisplayed(selector: string, timeout = 10_000): Promise<boolean> {
    try {
      const element = await $(selector);
      await element.waitForDisplayed({ timeout });
      return true;
    } catch {
      return false;
    }
  }

  protected async waitForElement(selector: string, timeout = 15_000): Promise<void> {
    const element = await $(selector);
    await element.waitForDisplayed({ timeout });
  }

  // ──────────────────────────────────────────────
  //  Gestures
  // ──────────────────────────────────────────────

  protected async scrollDown(): Promise<void> {
    if (driver.isAndroid) {
      await driver.execute('mobile: scrollGesture', {
        direction: 'down',
        percent: 0.75,
      });
    } else {
      await driver.execute('mobile: scroll', { direction: 'down' });
    }
  }

  protected async scrollToElement(selector: string, maxScrolls = 5): Promise<void> {
    for (let i = 0; i < maxScrolls; i++) {
      if (await this.isDisplayed(selector, 2_000)) return;
      await this.scrollDown();
    }
    throw new Error(`Element "${selector}" not found after ${maxScrolls} scrolls`);
  }

  // ──────────────────────────────────────────────
  //  Cross-platform selector helpers
  // ──────────────────────────────────────────────

  /**
   * Returns a platform-specific accessibility selector.
   * Android: content-desc | iOS: accessibility id
   */
  protected byAccessibilityId(id: string): string {
    return `~${id}`;
  }

  /**
   * Returns a platform-aware selector by resource-id (Android) or name (iOS).
   */
  protected byId(androidId: string, iosAccessibilityId: string): string {
    return driver.isAndroid
      ? `android=new UiSelector().resourceId("${androidId}")`
      : `~${iosAccessibilityId}`;
  }
}

