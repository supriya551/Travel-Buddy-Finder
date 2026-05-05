import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as tripStore from '../data/tripStore.js';
import asyncHandler from '../auth/asyncHandler.js';
import AppError from '../auth/AppError.js';
import { requireAuth } from '../auth/middleware.js';

const router = Router();

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Compute the number of days between two ISO date strings (inclusive).
 * e.g. "2026-01-14" to "2026-01-28" → 15 days
 */
function dayCount(startDate, endDate) {
  const ms = new Date(endDate) - new Date(startDate);
  return Math.round(ms / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Apply all optional query filters to a trip array and sort by startDate asc.
 */
function applyFilters(trips, query) {
  let result = [...trips];

  const { destination, style, minBudget, maxBudget, duration, gender } = query;

  if (destination) {
    const q = destination.toLowerCase();
    result = result.filter(t => t.destination.toLowerCase().includes(q));
  }

  if (style) {
    const q = style.toLowerCase();
    result = result.filter(t =>
      Array.isArray(t.styles) && t.styles.some(s => s.toLowerCase() === q)
    );
  }

  if (minBudget !== undefined && minBudget !== '') {
    const min = Number(minBudget);
    if (!isNaN(min)) result = result.filter(t => t.budget >= min);
  }

  if (maxBudget !== undefined && maxBudget !== '') {
    const max = Number(maxBudget);
    if (!isNaN(max)) result = result.filter(t => t.budget <= max);
  }

  if (duration && duration !== 'any') {
    result = result.filter(t => {
      const days = dayCount(t.startDate, t.endDate);
      if (duration === 'weekend') return days >= 1 && days <= 3;
      if (duration === 'short')   return days >= 4 && days <= 7;
      if (duration === 'medium')  return days >= 8 && days <= 14;
      if (duration === 'long')    return days >= 15;
      return true;
    });
  }

  if (gender && gender !== 'any') {
    result = result.filter(t => t.genderPreference === gender);
  }

  // Always sort by startDate ascending
  result.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

  return result;
}

// ── Routes ────────────────────────────────────────────────────────────────────

// GET /api/trips — list all trips (public), supports query filters
router.get('/', asyncHandler(async (req, res) => {
  const trips = tripStore.findAll();
  const filtered = applyFilters(trips, req.query);
  res.json(filtered);
}));

// GET /api/trips/mine — list current user's trips (auth required)
router.get('/mine', requireAuth, asyncHandler(async (req, res) => {
  const trips = tripStore.findByCreator(req.user.id);
  // Sort by startDate ascending
  trips.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  res.json(trips);
}));

// POST /api/trips — create a trip (auth required)
router.post('/', requireAuth, asyncHandler(async (req, res) => {
  const { destination, startDate, endDate, budget, title, buddiesNeeded, description, styles, genderPreference } = req.body;

  if (!destination || !startDate || !endDate || budget === undefined || budget === null || budget === '') {
    throw new AppError('destination, startDate, endDate, and budget are required.', 400);
  }

  const trip = tripStore.create({
    id: uuidv4(),
    creatorId: req.user.id,
    title: title || '',
    destination,
    startDate,
    endDate,
    budget: Number(budget),
    buddiesNeeded: buddiesNeeded ? Number(buddiesNeeded) : 1,
    description: description || '',
    styles: styles || [],
    genderPreference: genderPreference || 'any',
    joinRequests: [],
  });

  res.status(201).json(trip);
}));

// POST /api/trips/:id/join — join a trip (auth required)
router.post('/:id/join', requireAuth, asyncHandler(async (req, res) => {
  const trip = tripStore.findById(req.params.id);
  if (!trip) throw new AppError('Trip not found.', 404);

  if (trip.creatorId === req.user.id) {
    throw new AppError('You cannot join your own trip.', 403);
  }

  if (trip.joinRequests.includes(req.user.id)) {
    throw new AppError('You have already requested to join this trip.', 409);
  }

  const updated = tripStore.update(trip.id, {
    joinRequests: [...trip.joinRequests, req.user.id],
  });

  res.json(updated);
}));

// ── Error handler ─────────────────────────────────────────────────────────────
router.use((err, req, res, next) => {
  const status  = err instanceof AppError ? err.statusCode : 500;
  const message = err instanceof AppError ? err.message : 'Internal server error.';
  if (status === 500) console.error(err);
  res.status(status).json({ error: message });
});

export default router;
