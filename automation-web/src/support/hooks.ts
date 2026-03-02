import {
  Before,
  After,
  BeforeAll,
  AfterAll,
  setDefaultTimeout,
  IWorld,
  Status,
} from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, chromium, firefox, webkit } from 'playwright';
import { getConfig, EnvironmentConfig } from '../config/environment.config';

export interface HydraWorld extends IWorld {
  config: EnvironmentConfig;
  browser: Browser;
  context: BrowserContext;
  page: Page;
}

let browser: Browser;

BeforeAll(async function () {
  const config = getConfig();
  setDefaultTimeout(config.timeout);

  const launchers = { chromium, firefox, webkit };
  const launcher = launchers[config.browser];
  browser = await launcher.launch({
    headless: config.headless,
    ...config.launchOptions,
  });
});

Before(async function (this: HydraWorld, scenario: { pickle: { name: string } }) {
  const config = getConfig();
  this.config = config;
  this.browser = browser;

  this.context = await browser.newContext({
    viewport: config.viewport,
    ignoreHTTPSErrors: true,
    recordVideo: config.video !== 'off' ? { dir: 'test-results/videos' } : undefined,
  });

  if (config.trace !== 'off') {
    await this.context.tracing.start({ screenshots: true, snapshots: true, sources: true });
  }

  this.page = await this.context.newPage();
});

After(async function (this: HydraWorld, scenario: { pickle: { name: string }; result?: { status: typeof Status[keyof typeof Status] } }) {
  const config = getConfig();
  const scenarioName = scenario.pickle.name.replace(/\s+/g, '-').toLowerCase();
  const failed = scenario.result?.status === Status.FAILED;

  // Capture screenshot on failure
  if (failed && config.screenshot !== 'off') {
    const screenshot = await this.page.screenshot({
      path: `test-results/screenshots/${scenarioName}.png`,
      fullPage: true,
    });
    await this.attach(screenshot, 'image/png');
  }

  // Save trace on failure
  if (config.trace === 'retain-on-failure' && failed) {
    await this.context.tracing.stop({
      path: `test-results/traces/${scenarioName}.zip`,
    });
  } else if (config.trace !== 'off') {
    await this.context.tracing.stop();
  }

  await this.page?.close();
  await this.context?.close();
});

AfterAll(async function () {
  await browser?.close();
});

