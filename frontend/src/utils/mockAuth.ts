/**
 * Initialize mock test accounts in localStorage
 * This runs once on app startup to populate test data
 */
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
      firstName: 'John',
      lastName: 'Doe',
    },
    {
      id: 3,
      username: 'teacher',
      password: 'teacher123',
      role: 'teacher',
      email: 'teacher@spts.edu',
      firstName: 'Jane',
      lastName: 'Smith',
    },
  ];

  // Always initialize test accounts (overwrite if corrupted)
  localStorage.setItem('testAccounts', JSON.stringify(testAccounts));
  console.log('✅ Test accounts initialized');
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


