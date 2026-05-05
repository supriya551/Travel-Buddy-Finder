// ── Auth helpers ──────────────────────────────────────────────────────────────

export function getToken() {
  return localStorage.getItem('tb_token');
}

export function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── Generic request helper ────────────────────────────────────────────────────

async function request(path, options = {}) {
  const { headers: extraHeaders, ...rest } = options;
  const res = await fetch(path, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...extraHeaders,
    },
  });
  const data = await res.json();
  if (!res.ok) throw Object.assign(new Error(data.error || 'Something went wrong.'), { status: res.status });
  return data;
}

// ── Trip API helpers ──────────────────────────────────────────────────────────

/**
 * GET /api/trips — public, supports optional filter params.
 * @param {Object} filters — { destination, style, minBudget, maxBudget, duration, gender }
 */
export function fetchTrips(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') params.set(k, v);
  });
  const qs = params.toString();
  return request(`/api/trips${qs ? `?${qs}` : ''}`);
}

/**
 * GET /api/trips/mine — auth required.
 */
export function fetchMyTrips() {
  return request('/api/trips/mine', { headers: authHeaders() });
}

/**
 * POST /api/trips — auth required.
 * @param {Object} tripData
 */
export function createTrip(tripData) {
  return request('/api/trips', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(tripData),
  });
}

/**
 * POST /api/trips/:id/join — auth required.
 * @param {string} tripId
 */
export function joinTrip(tripId) {
  return request(`/api/trips/${tripId}/join`, {
    method: 'POST',
    headers: authHeaders(),
  });
}

// ── User API helpers ──────────────────────────────────────────────────────────

/**
 * GET /api/users/matches — auth required.
 */
export function fetchMatches() {
  return request('/api/users/matches', { headers: authHeaders() });
}

/**
 * POST /api/users/:id/connect — auth required.
 * @param {string} userId
 */
export function connectUser(userId) {
  return request(`/api/users/${userId}/connect`, {
    method: 'POST',
    headers: authHeaders(),
  });
}
