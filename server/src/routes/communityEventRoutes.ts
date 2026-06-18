import { Router } from 'express';
// refresh
// refresh
import {
    getEvents,
    getEvent,
    createEvent,
    updateEvent,
    deleteEvent,
    rsvpEvent,
    getEventAttendees,
    getMyEvents
} from '../controllers/communityEventController';
import { authenticateJWT, optionalAuth } from '../middleware/authMiddleware';

const router = Router();

// @route   GET /api/community-events
// @desc    Get all community events
// @access  Public
router.get('/', getEvents);

// @route   GET /api/community-events/my
// @desc    Get user's events
// @access  Private
router.get('/my', authenticateJWT, getMyEvents);

// @route   GET /api/community-events/:id
// @desc    Get event details
// @access  Public
router.get('/:id', getEvent);

// @route   POST /api/community-events
// @desc    Create an event
// @access  Private
router.post('/', authenticateJWT, createEvent);

// @route   PATCH /api/community-events/:id
// @desc    Update event
// @access  Private (organizer only)
router.patch('/:id', authenticateJWT, updateEvent);

// @route   DELETE /api/community-events/:id
// @desc    Delete event
// @access  Private (organizer only)
router.delete('/:id', authenticateJWT, deleteEvent);

// @route   POST /api/community-events/:id/rsvp
// @desc    RSVP to event
// @access  Private
router.post('/:id/rsvp', authenticateJWT, rsvpEvent);

// @route   GET /api/community-events/:id/attendees
// @desc    Get event attendees
// @access  Public
router.get('/:id/attendees', getEventAttendees);

export default router;

