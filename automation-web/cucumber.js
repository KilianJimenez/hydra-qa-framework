const common = {
  requireModule: ['ts-node/register'],
  require: ['src/steps/**/*.ts', 'src/support/**/*.ts'],
  paths: ['../features/**/*.feature'],
  format: [
    'progress-bar',
    'json:test-results/cucumber-report.json',
    'html:test-results/cucumber-report.html',
  ],
  formatOptions: { snippetInterface: 'async-await' },
  publishQuiet: true,
};

module.exports = {
  default: {
    ...common,
  },
  smoke: {
    ...common,
    tags: '@smoke',
  },
  regression: {
    ...common,
    tags: '@regression',
  },
};

