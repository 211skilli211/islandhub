import { Request, Response } from 'express';
import { EventModel, CampaignEvent } from '../models/Event';

export const createEvent = async (req: Request, res: Response) => {
    try {
        const campaignId = parseInt(req.params.id as string);
        const { title, description, event_type, start_time, end_time, location, max_attendees } = req.body;

        // Validations (basic)
        if (!title || !start_time || !end_time) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const newEvent: CampaignEvent = {
            campaign_id: campaignId,
            title,
            description,
            event_type,
            start_time: new Date(start_time),
            end_time: new Date(end_time),
            location,
            max_attendees
        };

        const createdEvent = await EventModel.create(newEvent);
        res.status(201).json(createdEvent);
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ message: 'Server error creating event' });
    }
};

export const getCampaignEvents = async (req: Request, res: Response) => {
    try {
        const campaignId = parseInt(req.params.id as string);
        const events = await EventModel.findByCampaignId(campaignId);
        res.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ message: 'Server error fetching events' });
    }
};

export const registerForEvent = async (req: Request, res: Response) => {
    try {
        const eventId = parseInt(req.params.id as string);
        const userId = req.body.user_id; // In a real app, get this from req.user set by auth middleware

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const registration = await EventModel.registerUser(eventId, userId);

        if (!registration) {
            // If returns nothing, it might be a duplicate due to ON CONFLICT DO NOTHING
            // Or the event doesn't exist (handled by foreign key constraint usually, but let's assume valid)
            return res.status(409).json({ message: 'Already registered or failed' });
        }

        res.status(201).json(registration);
    } catch (error) {
        console.error('Error registering for event:', error);
        res.status(500).json({ message: 'Server error registering for event' });
    }
};

export const getEventAttendees = async (req: Request, res: Response) => {
    try {
        const eventId = parseInt(req.params.id as string);
        const attendees = await EventModel.getAttendees(eventId);
        res.json(attendees);
    } catch (error) {
        console.error('Error fetching attendees:', error);
        res.status(500).json({ message: 'Server error fetching attendees' });
    }
};

export const getRegistrationsByUser = async (req: Request, res: Response) => {
    try {
        const userId = parseInt(req.params.id as string);
        const registrations = await EventModel.getUserRegistrations(userId);
        res.json(registrations);
    } catch (error) {
        console.error('Error fetching user registrations:', error);
        res.status(500).json({ message: 'Server error fetching user registrations' });
    }
};
