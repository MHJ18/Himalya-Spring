describe('Supabase session expiry', () => {
  beforeEach(() => {
    jest.resetModules();
    localStorage.clear();
    process.env.REACT_APP_SUPABASE_URL = 'https://example.supabase.co';
    process.env.REACT_APP_SUPABASE_ANON_KEY = 'publishable-test-key';
  });

  it('notifies the app and returns a readable error when no refresh session exists', async () => {
    const { dbRequest, getSessionExpiredEventName } = require('../supabaseClient');
    const handler = jest.fn();
    window.addEventListener(getSessionExpiredEventName(), handler);

    await expect(dbRequest('/customers?select=*')).rejects.toThrow(
      'Your session has expired. Please sign in again.'
    );
    expect(handler).toHaveBeenCalledTimes(1);

    window.removeEventListener(getSessionExpiredEventName(), handler);
  });
});
