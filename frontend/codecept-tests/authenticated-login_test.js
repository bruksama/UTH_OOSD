Feature('Authenticated frontend login');

const getCredentials = () => {
  const email = process.env.CODECEPT_TEST_EMAIL;
  const password = process.env.CODECEPT_TEST_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'Set CODECEPT_TEST_EMAIL and CODECEPT_TEST_PASSWORD before running Codecept E2E tests.'
    );
  }

  return { email, password };
};

const clearBrowserState = async (I) => {
  await I.amOnPage('/login');
  await I.clearCookie();
  await I.executeScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
};

const waitForBackendProfile = async (I) => {
  const response = await I.waitForResponse((response) => {
    return response.url().includes('/api/auth/me') && response.status() === 200;
  }, 20);

  const profile = await response.json();

  if (profile.role !== 'student') {
    throw new Error(`Expected backend student role from /api/auth/me, got "${profile.role}".`);
  }

  if (!profile.studentId) {
    throw new Error(
      'Expected /api/auth/me to return a linked studentId. Use a Firebase test user linked to a backend student record.'
    );
  }

  if (typeof profile.uid === 'string' && profile.uid.startsWith('mock-')) {
    throw new Error('Expected a real Firebase UID from /api/auth/me, got a mock UID.');
  }

  return profile;
};

const loginAsStudent = async (I) => {
  const { email, password } = getCredentials();

  await I.amOnPage('/login');
  await I.see('SPTS Login');
  await I.fillField('input[type="email"]', email);
  await I.fillField('input[type="password"]', password);
  await I.click('Sign In');
  await waitForBackendProfile(I);
  await I.waitInUrl('/student/dashboard', 20);
  await I.waitForText('Sign Out', 20);
};

Before(async ({ I }) => {
  getCredentials();
  await clearBrowserState(I);
});

Scenario('student can log in and reach dashboard', async ({ I }) => {
  await loginAsStudent(I);
  await I.see('Welcome back');
});

Scenario('student can access protected profile route after login', async ({ I }) => {
  await loginAsStudent(I);
  await I.amOnPage('/student/profile');
  await I.waitInUrl('/student/profile', 10);
  await I.see('Personal Account Details');
  await I.dontSee('Student not found');
  await I.see('Sign Out');
  await I.dontSee('SPTS Login');
});

Scenario('student can sign out and return to login', async ({ I }) => {
  await loginAsStudent(I);
  await I.click('Sign Out');
  await I.waitInUrl('/login', 10);
  await I.see('SPTS Login');
});
