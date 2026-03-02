import type { Options } from '@wdio/types';
import { getCapabilities } from './src/config/capabilities.config';
import dotenv from 'dotenv';

dotenv.config();

const platform = (process.env.TEST_PLATFORM || 'android') as 'android' | 'ios';

export const config: Options.Testrunner = {
  runner: 'local',
  autoCompileOpts: {
    tsNodeOpts: {
      project: './tsconfig.json',
    },
  },

  specs: ['../features/**/*.feature'],
  exclude: [],

  maxInstances: 1,
  capabilities: [getCapabilities(platform)],

  logLevel: 'info',
  bail: 0,
  waitforTimeout: 15_000,
  connectionRetryTimeout: 120_000,
  connectionRetryCount: 3,

  services: ['appium'],
  port: 4723,
  path: '/',

  framework: 'cucumber',
  cucumberOpts: {
    require: ['./src/steps/**/*.ts', './src/support/**/*.ts'],
    backtrace: false,
    dryRun: false,
    failFast: false,
    snippets: true,
    source: true,
    strict: false,
    timeout: 60_000,
  },

  reporters: [
    'spec',
    [
      'allure',
      {
        outputDir: 'allure-results',
        disableWebdriverStepsReporting: true,
        disableWebdriverScreenshotsReporting: false,
      },
    ],
  ],

  // ── Hooks ────────────────────────────────────────
  afterTest: async function (_test: unknown, _context: unknown, { passed }: { passed: boolean }) {
    if (!passed) {
      await browser.takeScreenshot();
    }
  },
};

