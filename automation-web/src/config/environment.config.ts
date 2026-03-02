import { LaunchOptions } from 'playwright';

export interface EnvironmentConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  headless: boolean;
  browser: 'chromium' | 'firefox' | 'webkit';
  viewport: { width: number; height: number };
  trace: 'on' | 'off' | 'retain-on-failure';
  screenshot: 'on' | 'off' | 'only-on-failure';
  video: 'on' | 'off' | 'retain-on-failure';
  launchOptions: LaunchOptions;
}

const environments: Record<string, EnvironmentConfig> = {
  local: {
    baseUrl: 'http://localhost:3000',
    timeout: 30_000,
    retries: 0,
    headless: process.env.HEADED !== 'true',
    browser: (process.env.BROWSER as EnvironmentConfig['browser']) || 'chromium',
    viewport: { width: 1920, height: 1080 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
    launchOptions: {
      slowMo: 0,
    },
  },
  staging: {
    baseUrl: 'https://staging.example.com',
    timeout: 45_000,
    retries: 1,
    headless: true,
    browser: 'chromium',
    viewport: { width: 1920, height: 1080 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    launchOptions: {},
  },
  production: {
    baseUrl: 'https://www.example.com',
    timeout: 60_000,
    retries: 2,
    headless: true,
    browser: 'chromium',
    viewport: { width: 1920, height: 1080 },
    trace: 'off',
    screenshot: 'only-on-failure',
    video: 'off',
    launchOptions: {},
  },
};

export function getConfig(): EnvironmentConfig {
  const env = process.env.TEST_ENV || 'local';
  const config = environments[env];
  if (!config) {
    throw new Error(`Unknown environment: ${env}. Available: ${Object.keys(environments).join(', ')}`);
  }
  return config;
}

