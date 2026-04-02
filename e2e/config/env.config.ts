type Environment = 'local' | 'dev' | 'staging' | 'production';

interface EnvironmentConfig {
  baseURL: string;
  timeout: number;
}

const environments: Record<Environment, EnvironmentConfig> = {
  local: {
    baseURL: 'http://localhost:3000',
    timeout: 30_000,
  },
  dev: {
    baseURL: 'https://dev.example.com',
    timeout: 30_000,
  },
  staging: {
    baseURL: 'https://staging.example.com',
    timeout: 30_000,
  },
  production: {
    baseURL: 'https://www.example.com',
    timeout: 30_000,
  },
};

function getEnvironment(): Environment {
  const env = (process.env.TEST_ENV as Environment) || 'local';
  if (!environments[env]) {
    throw new Error(`Unknown environment: ${env}. Valid values: ${Object.keys(environments).join(', ')}`);
  }
  return env;
}

export const envConfig = environments[getEnvironment()];
