/**
 * Mock Authentication Service for Development
 * Replaces Firebase when not configured with valid credentials
 */

interface MockUser {
  uid: string;
  email: string;
  displayName: string;
}

interface MockAuthState {
  user: MockUser | null;
  isLoading: boolean;
  error: string | null;
}

class MockAuthService {
  private readonly state: MockAuthState = {
    user: null,
    isLoading: false,
    error: null,
  };

  private listeners: ((state: MockAuthState) => void)[] = [];

  subscribe(callback: (state: MockAuthState) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }

  async register(email: string, _password: string): Promise<MockUser> {
    this.state.isLoading = true;
    this.notifyListeners();

    return new Promise((resolve) => {
      setTimeout(() => {
        const user: MockUser = {
          uid: `mock-${Date.now()}`,
          email,
          displayName: email.split('@')[0],
        };
        this.state.user = user;
        this.state.isLoading = false;
        this.state.error = null;
        this.notifyListeners();
        resolve(user);
      }, 500);
    });
  }

  async login(email: string, _password: string): Promise<MockUser> {
    this.state.isLoading = true;
    this.notifyListeners();

    return new Promise((resolve) => {
      setTimeout(() => {
        const user: MockUser = {
          uid: `mock-${email}`,
          email,
          displayName: email.split('@')[0],
        };
        this.state.user = user;
        this.state.isLoading = false;
        this.state.error = null;
        this.notifyListeners();
        resolve(user);
      }, 500);
    });
  }

  async logout(): Promise<void> {
    this.state.user = null;
    this.notifyListeners();
  }

  getCurrentUser(): MockUser | null {
    return this.state.user;
  }

  getState(): MockAuthState {
    return this.state;
  }
}

export const mockAuthService = new MockAuthService();
