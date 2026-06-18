import express from 'express';
import {
    updateRentalCategory,
    // Availability
    getAvailability,
    addAvailability,
    deleteAvailability,
    // Pricing
    getPricingTiers,
    addPricingTier,
    deletePricingTier,
    // Seasonal Rates
    getSeasonalRates,
    addSeasonalRate,
    deleteSeasonalRate,
    // Search
    getRentals
} from '../controllers/rentalController';
import { authenticateJWT, isAdmin } from '../middleware/authMiddleware';

const router = express.Router();

// Public Routes
router.get('/', getRentals); // /api/rentals?category=X&subtype=Y

// Availability (Public visibility, Protected modification)
// Note: Availability is public to view, but adding/removing requires ownership (protected)
router.get('/:id/availability', getAvailability);
router.post('/:id/availability', authenticateJWT, addAvailability);
router.delete('/:id/availability/:availabilityId', authenticateJWT, deleteAvailability);

// Pricing (Public visibility, Protected modification)
router.get('/:id/pricing', getPricingTiers);
router.post('/:id/pricing', authenticateJWT, addPricingTier);
router.delete('/:id/pricing/:pricingId', authenticateJWT, deletePricingTier);

// Seasonal Rates (Public visibility, Protected modification)
router.get('/:id/seasonal-rates', getSeasonalRates);
router.post('/:id/seasonal-rates', authenticateJWT, addSeasonalRate);
router.delete('/:id/seasonal-rates/:rateId', authenticateJWT, deleteSeasonalRate);

// Category Assignment (Protected)
router.patch('/:id/category', authenticateJWT, updateRentalCategory);

export default router;
