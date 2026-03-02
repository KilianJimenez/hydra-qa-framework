import { Before, After } from '@wdio/cucumber-framework';
import { SessionManager } from './session-manager';

Before(async function () {
  SessionManager.resetCounter();
  await SessionManager.restartSessionIfNeeded();
});

After(async function (scenario) {
  if (scenario.result?.status === 'FAILED') {
    const screenshot = await driver.takeScreenshot();
    this.attach(Buffer.from(screenshot, 'base64'), 'image/png');
  }
});

