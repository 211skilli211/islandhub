import { Router } from 'express';
import { authenticateJWT, isAdmin } from '../middleware/authMiddleware';
import {
    updateDriverLocation,
    toggleDriverOnline,
    getDriverStatus,
    findNearestDrivers,
    createDispatchRequest,
    acceptDispatch,
    rejectDispatch,
    updateTripStatus,
    getDriverEarnings,
    getCurrentTrip,
    rateTrip,
    updateFare,
    getMyDispatchRequests,
    getRiderActiveTrip,
    trackTripById,
    cancelRide,
    recordLocationPoint,
    getTripLocationHistory,
    streamDriverLocation,
} from '../controllers/dispatchController';

const router = Router();

// Driver location & status
router.post('/location', authenticateJWT, updateDriverLocation);
router.post('/online', authenticateJWT, toggleDriverOnline);
router.get('/status', authenticateJWT, getDriverStatus);

// Dispatch operations
router.post('/dispatch/create', authenticateJWT, createDispatchRequest);
router.get('/dispatch/nearest', authenticateJWT, findNearestDrivers);
router.post('/dispatch/accept', authenticateJWT, acceptDispatch);
router.post('/dispatch/reject', authenticateJWT, rejectDispatch);
router.get('/my-requests', authenticateJWT, getMyDispatchRequests);

// Trip management
router.post('/trip/status', authenticateJWT, updateTripStatus);
router.get('/trip/current', authenticateJWT, getCurrentTrip);
router.post('/trip/rate', authenticateJWT, rateTrip);

// Earnings
router.get('/earnings', authenticateJWT, getDriverEarnings);

// Fare management (admin)
router.post('/fare/update', authenticateJWT, isAdmin, updateFare);

// ─── Rider-side ride tracking ───────────────────────────────────────────────
router.get('/rides/active', authenticateJWT, getRiderActiveTrip);
router.get('/rides/tracking/:tripId', trackTripById);
router.post('/rides/:tripId/cancel', authenticateJWT, cancelRide);

// ─── Live location & polyline ───────────────────────────────────────────────
router.post('/location/record', authenticateJWT, recordLocationPoint);
router.get('/rides/:tripId/location-history', getTripLocationHistory);
router.get('/rides/:tripId/location-stream', streamDriverLocation);

export default router;