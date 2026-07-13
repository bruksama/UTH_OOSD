import { beforeEach, describe, expect, it, vi } from 'vitest';

const signOut = vi.fn();
vi.mock('../config/firebase', () => ({ auth: { currentUser: null, signOut } }));

describe('API interceptors', () => {
  beforeEach(() => {
    vi.resetModules();
    signOut.mockReset();
  });

  it('rethrows transport failures unchanged', async () => {
    const { default: api } = await import('./api');
    const error = new Error('request failed');
    await expect(api.request({ adapter: async () => { throw error; } })).rejects.toBe(error);
  });

  it('does not sign out for a 401 profile fetch', async () => {
    const { default: api } = await import('./api');
    const error = { config: { url: '/auth/me' }, response: { status: 401, data: {} }, message: 'Unauthorized' };
    await expect(api.request({ url: '/auth/me', adapter: async () => { throw error; } })).rejects.toBe(error);
    expect(signOut).not.toHaveBeenCalled();
  });

  it('signs out for a 401 outside the profile endpoint', async () => {
    const { default: api } = await import('./api');
    const error = { config: { url: '/students' }, response: { status: 401, data: {} }, message: 'Unauthorized' };
    const originalLocation = window.location;
    Object.defineProperty(window, 'location', { configurable: true, value: { href: '' } });
    await expect(api.request({ url: '/students', adapter: async () => { throw error; } })).rejects.toBe(error);
    expect(signOut).toHaveBeenCalledOnce();
    expect(window.location.href).toBe('/login');
    Object.defineProperty(window, 'location', { configurable: true, value: originalLocation });
  });
});
