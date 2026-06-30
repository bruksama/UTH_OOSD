const headless = process.env.HEADLESS !== 'false';
const baseUrl = process.env.CODECEPT_BASE_URL || 'http://localhost:5173';

const validateCredentials = () => {
  if (!process.env.CODECEPT_TEST_EMAIL || !process.env.CODECEPT_TEST_PASSWORD) {
    throw new Error(
      'Set CODECEPT_TEST_EMAIL and CODECEPT_TEST_PASSWORD before running Codecept E2E tests.'
    );
  }
};

export default {
  tests: './codecept-tests/*_test.js',
  output: './output',
  bootstrap: validateCredentials,
  helpers: {
    Playwright: {
      url: baseUrl,
      browser: 'chromium',
      show: !headless,
      waitForTimeout: 10000,
    },
  },
  include: {},
  name: 'spts-frontend',
  plugins: {
    retryFailedStep: {
      enabled: true,
    },
    screenshot: {
      enabled: true,
      onFail: true,
    },
    testomatio: {
      enabled: true,
      require: '@testomatio/reporter/codecept',
      html: true,
      reportDir: 'output/report',
    },
  },
};
