/**
 * Utility functions for managing authentication tokens in localStorage
 */

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';
const ORIGINAL_ADMIN_TOKENS_KEY = 'originalAdminTokens';

export interface StoredUser {
  id: string;
  email?: string;
  username?: string;
  name?: string;
  surname?: string;
  phoneNumber?: string;
  avatarImageUrl?: string;
  role?: 0 | 1; // 0 = User, 1 = Admin
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  refreshTokenExpiresAt: string;
  user: StoredUser;
}

/**
 * Store authentication tokens and user data
 */
export function storeAuthTokens(tokens: AuthTokens): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  localStorage.setItem('tokenExpiresAt', tokens.expiresAt);
  localStorage.setItem('refreshTokenExpiresAt', tokens.refreshTokenExpiresAt);
  localStorage.setItem(USER_KEY, JSON.stringify(tokens.user));
  // Dispatch custom event to notify components of authentication state change
  window.dispatchEvent(new Event('authStateChanged'));
  window.dispatchEvent(new Event('userDataUpdated'));
}

/**
 * Get the stored access token
 */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

/**
 * Get the stored refresh token
 */
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * Get the stored user data
 */
export function getStoredUser(): StoredUser | null {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr) as StoredUser;
  } catch {
    return null;
  }
}

/**
 * Store user data
 */
export function storeUserData(user: StoredUser): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  // Dispatch custom event to notify components of user data update
  window.dispatchEvent(new Event('userDataUpdated'));
}

/**
 * Check if user is authenticated (has valid token)
 */
export function isAuthenticated(): boolean {
  const token = getAccessToken();
  if (!token) return false;
  
  const expiresAt = localStorage.getItem('tokenExpiresAt');
  if (!expiresAt) return false;
  
  // Check if token is expired
  const expirationDate = new Date(expiresAt);
  return expirationDate > new Date();
}

/**
 * Store original admin tokens before impersonating
 */
export function storeOriginalAdminTokens(tokens: AuthTokens): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ORIGINAL_ADMIN_TOKENS_KEY, JSON.stringify(tokens));
}

/**
 * Get original admin tokens (if impersonating)
 */
export function getOriginalAdminTokens(): AuthTokens | null {
  if (typeof window === 'undefined') return null;
  const tokensStr = localStorage.getItem(ORIGINAL_ADMIN_TOKENS_KEY);
  if (!tokensStr) return null;
  try {
    return JSON.parse(tokensStr) as AuthTokens;
  } catch {
    return null;
  }
}

/**
 * Check if currently impersonating
 */
export function isImpersonating(): boolean {
  return getOriginalAdminTokens() !== null;
}

/**
 * Stop impersonating and restore original admin session
 */
export function stopImpersonating(): boolean {
  const originalTokens = getOriginalAdminTokens();
  if (!originalTokens) return false;
  
  // Restore original admin tokens
  storeAuthTokens(originalTokens);
  
  // Clear the stored original tokens
  if (typeof window !== 'undefined') {
    localStorage.removeItem(ORIGINAL_ADMIN_TOKENS_KEY);
    // Dispatch event to notify components that impersonation has stopped
    window.dispatchEvent(new Event('impersonationStopped'));
    window.dispatchEvent(new Event('authStateChanged'));
    window.dispatchEvent(new Event('userDataUpdated'));
  }
  
  return true;
}

/**
 * Clear all authentication data
 */
export function clearAuthTokens(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem('tokenExpiresAt');
  localStorage.removeItem('refreshTokenExpiresAt');
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(ORIGINAL_ADMIN_TOKENS_KEY);
  // Dispatch custom event to notify components of authentication state change
  window.dispatchEvent(new Event('authStateChanged'));
  window.dispatchEvent(new Event('userDataUpdated'));
}

