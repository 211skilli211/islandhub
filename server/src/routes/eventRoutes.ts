import express from 'express';
import { createEvent, getCampaignEvents, registerForEvent, getEventAttendees, getRegistrationsByUser } from '../controllers/eventController';

const router = express.Router();

// @route   GET /api/events/campaign/:id
// @desc    Get all events for a campaign
// @access  Public
router.get('/campaign/:id', getCampaignEvents);

// @route   POST /api/events/campaign/:id
// @desc    Create an event for a campaign
// @access  Private (Creator/Admin)
router.post('/campaign/:id', createEvent);

// @route   POST /api/events/:id/register
// @desc    Register user for an event
// @access  Private
router.post('/:id/register', registerForEvent);

// @route   GET /api/events/:id/attendees
// @desc    Get attendees for an event
// @access  Private (Creator/Admin)
router.get('/:id/attendees', getEventAttendees);

// @route   GET /api/events/user/:id
// @desc    Get all event registrations for a user
// @access  Private
router.get('/user/:id', getRegistrationsByUser);

export default router;
