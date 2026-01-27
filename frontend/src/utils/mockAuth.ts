/**
 * Initialize mock test accounts in localStorage
 * This runs once on app startup to populate test data
 * 
 * SPTS has 2 roles:
 * - Admin: Manages students, courses, alerts
 * - Student: Views their own grades and alerts
 */

const ACCOUNTS_VERSION = 2; // Increment this when accounts change

export const initializeMockAccounts = () => {
  const testAccounts = [
    {
      id: 1,
      username: 'admin',
      password: 'admin123',
      role: 'admin',
      email: 'admin@spts.edu',
      firstName: 'Admin',
      lastName: 'User',
    },
    {
      id: 2,
      username: 'student',
      password: 'student123',
      role: 'student',
      email: 'student@spts.edu',
      firstName: 'Nguyen',
      lastName: 'Van A',
      studentId: 1, // Maps to student id in database
    },
  ];

  // Check version to force update if accounts changed
  const storedVersion = localStorage.getItem('testAccountsVersion');
  if (storedVersion !== String(ACCOUNTS_VERSION)) {
    localStorage.setItem('testAccounts', JSON.stringify(testAccounts));
    localStorage.setItem('testAccountsVersion', String(ACCOUNTS_VERSION));
    console.log('✅ Test accounts updated to version', ACCOUNTS_VERSION);
  }
};

/**
 * Get all test accounts
 */
export const getTestAccounts = () => {
  const accounts = localStorage.getItem('testAccounts');
  return accounts ? JSON.parse(accounts) : [];
};

/**
 * Authenticate user by username and password
 */
export const authenticateUser = (username: string, password: string) => {
  const accounts = getTestAccounts();
  const user = accounts.find(
    (acc: any) => acc.username === username && acc.password === password
  );
  return user || null;
};
