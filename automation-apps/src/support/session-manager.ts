/**
 * Session manager for Appium — handles session lifecycle, restarts, and stability.
 */

export class SessionManager {
  private static restartCount = 0;
  private static readonly MAX_RESTARTS = 3;

  /**
   * Restart the Appium session if it becomes unresponsive.
   * Implements exponential backoff between retries.
   */
  static async restartSessionIfNeeded(): Promise<void> {
    try {
      // Health check — if this fails, the session is dead
      await driver.getPageSource();
    } catch {
      if (this.restartCount >= this.MAX_RESTARTS) {
        throw new Error(`Session restart limit reached (${this.MAX_RESTARTS}). Aborting.`);
      }
      this.restartCount++;
      const backoffMs = Math.pow(2, this.restartCount) * 1_000;
      console.warn(`⚠️ Session unhealthy. Restarting (attempt ${this.restartCount})... waiting ${backoffMs}ms`);
      await new Promise((resolve) => setTimeout(resolve, backoffMs));
      await driver.reloadSession();
    }
  }

  /**
   * Reset restart counter (call at the beginning of each scenario).
   */
  static resetCounter(): void {
    this.restartCount = 0;
  }

  /**
   * Close the app and re-launch to get a clean state.
   */
  static async resetApp(appId: string): Promise<void> {
    try {
      await driver.terminateApp(appId);
    } catch {
      // App may not be running — that's fine
    }
    await driver.activateApp(appId);
  }
}

