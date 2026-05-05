import { Router } from 'express';
import * as tripStore from '../data/tripStore.js';
import * as connectionStore from '../data/connectionStore.js';
import * as userStore from '../data/userStore.js';
import asyncHandler from '../auth/asyncHandler.js';
import AppError from '../auth/AppError.js';
import { requireAuth } from '../auth/middleware.js';

const router = Router();

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Get the set of destinations for a given user id from the trips store.
 * Includes trips the user created and trips they have joined.
 */
function getUserDestinations(userId, allTrips) {
  return allTrips
    .filter(t => t.creatorId === userId || (Array.isArray(t.joinRequests) && t.joinRequests.includes(userId)))
    .map(t => t.destination);
}

/**
 * Case-insensitive substring overlap check between two destination strings.
 */
function destinationsOverlap(destA, destB) {
  const a = destA.toLowerCase();
  const b = destB.toLowerCase();
  return a.includes(b) || b.includes(a);
}

// ── Routes ────────────────────────────────────────────────────────────────────

// GET /api/users/matches — buddy matches for current user (auth required)
router.get('/matches', requireAuth, asyncHandler(async (req, res) => {
  const allTrips = tripStore.findAll();
  const currentUserDests = getUserDestinations(req.user.id, allTrips);

  if (currentUserDests.length === 0) {
    return res.json([]);
  }

  // Load all users except the current user
  const allUsers = userStore.findAll ? userStore.findAll() : [];
  const otherUsers = allUsers.filter(u => u.id !== req.user.id);

  const currentUser = userStore.findById(req.user.id);
  const currentStyles = (currentUser?.styles || []).map(s => s.toLowerCase());

  const matches = [];

  for (const candidate of otherUsers) {
    const candidateDests = getUserDestinations(candidate.id, allTrips);
    if (candidateDests.length === 0) continue;

    // Find first overlapping destination
    let matchedDestination = null;
    for (const cd of candidateDests) {
      for (const ud of currentUserDests) {
        if (destinationsOverlap(cd, ud)) {
          matchedDestination = cd;
          break;
        }
      }
      if (matchedDestination) break;
    }

    if (!matchedDestination) continue;

    // Style overlap count for ranking
    const candidateStyles = (candidate.styles || []).map(s => s.toLowerCase());
    const styleOverlap = candidateStyles.filter(s => currentStyles.includes(s)).length;

    matches.push({ id: candidate.id, name: candidate.name, matchedDestination, styleOverlap });
  }

  // Sort: more style overlap first
  matches.sort((a, b) => b.styleOverlap - a.styleOverlap);

  // Return top 5, strip internal styleOverlap field
  const top5 = matches.slice(0, 5).map(({ id, name, matchedDestination }) => ({ id, name, matchedDestination }));
  res.json(top5);
}));

// POST /api/users/:id/connect — send a connection request (auth required)
router.post('/:id/connect', requireAuth, asyncHandler(async (req, res) => {
  const targetId = req.params.id;

  if (targetId === req.user.id) {
    throw new AppError('You cannot connect with yourself.', 400);
  }

  const target = userStore.findById(targetId);
  if (!target) throw new AppError('User not found.', 404);

  if (connectionStore.exists(req.user.id, targetId)) {
    throw new AppError('Connection already exists.', 409);
  }

  connectionStore.create(req.user.id, targetId);
  res.json({ success: true });
}));

// ── Error handler ─────────────────────────────────────────────────────────────
router.use((err, req, res, next) => {
  const status  = err instanceof AppError ? err.statusCode : 500;
  const message = err instanceof AppError ? err.message : 'Internal server error.';
  if (status === 500) console.error(err);
  res.status(status).json({ error: message });
});

export default router;
