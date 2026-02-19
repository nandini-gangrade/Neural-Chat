/**
 * auth.js — Mock Authentication Service
 *
 * How it works:
 *  - Users are stored as a JSON array in localStorage under key 'nc_users'
 *  - A default demo user is seeded automatically on first load
 *  - Login checks email + password against the stored array
 *  - On success, a session object { name, email } is written to 'nc_session'
 *  - Logout removes 'nc_session'
 *  - All route guards in App.jsx read 'nc_session' to decide access
 *
 * Storage keys:
 *  nc_users   — JSON array of { name, email, password }
 *  nc_session — JSON object  { name, email }  (null when logged out)
 */

const USERS_KEY   = 'nc_users';
const SESSION_KEY = 'nc_session';

// ── Seed default demo account ──────────────────────────────
const _seed = () => {
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(
      USERS_KEY,
      JSON.stringify([
        { name: 'Demo User', email: 'demo@neuralchat.ai', password: 'demo1234' },
      ])
    );
  }
};
_seed();

// ── Helpers ────────────────────────────────────────────────

const getUsers = () =>
  JSON.parse(localStorage.getItem(USERS_KEY) || '[]');

const saveUsers = (users) =>
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

// ── Public API ─────────────────────────────────────────────

/**
 * Register a new user.
 * Throws an Error if the email is already taken.
 */
export const registerUser = (name, email, password) => {
  const users = getUsers();
  const emailNorm = email.trim().toLowerCase();

  if (users.find((u) => u.email.toLowerCase() === emailNorm)) {
    throw new Error('An account with this email already exists.');
  }

  const newUser = { name: name.trim(), email: emailNorm, password };
  saveUsers([...users, newUser]);
  return newUser;
};

/**
 * Authenticate with email + password.
 * On success, writes session to localStorage and returns the session object.
 * Throws an Error on invalid credentials.
 */
export const loginUser = (email, password) => {
  const users = getUsers();
  const emailNorm = email.trim().toLowerCase();
  const user = users.find(
    (u) => u.email.toLowerCase() === emailNorm && u.password === password
  );

  if (!user) {
    throw new Error('Incorrect email or password.');
  }

  const session = { name: user.name, email: user.email };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
};

/**
 * Log out the current user by removing the session key.
 */
export const logoutUser = () => {
  localStorage.removeItem(SESSION_KEY);
};

/**
 * Return the currently logged-in user object, or null if not logged in.
 */
export const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};
