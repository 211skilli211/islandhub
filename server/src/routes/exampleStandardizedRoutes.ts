import { Router, Request, Response } from 'express';
import { validate } from '../middleware/validation';
import { asyncHandler, sendSuccess, sendError, BadRequestError, NotFoundError, UnauthorizedError } from '../middleware/errorHandler';
import { schemas } from '../validation/schemas';
import { OrderModel } from '../models/Order';
import { authenticateJWT } from '../middleware/authMiddleware';
import { applyCustomerVipBenefits } from '../middleware/subscriptionMiddleware';

const router = Router();

/**
 * Example of standardized API route with validation and error handling
 * This shows the pattern all routes should follow
 */

// @route   POST /api/orders
// @desc    Create a new order (pending)
// @access  Private (or Optional Auth)
router.post(
  '/',
  authenticateJWT,
  applyCustomerVipBenefits,
  validate(schemas.order.create),
  asyncHandler(async (req: Request, res: Response) => {
    const { items, shipping_address, payment_method, currency, notes } = req.body;
    const user_id = (req as any).user?.id || null;

    // Business logic validation
    if (!items || items.length === 0) {
      throw new BadRequestError('At least one item is required', 'EMPTY_CART');
    }

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.10; // 10% tax
    const serviceFee = subtotal * 0.05; // 5% service fee
    const total = subtotal + tax + serviceFee;

    // Create order
    const order = await OrderModel.create({
      user_id,
      items,
      tax_amount: tax,
      service_fee: serviceFee,
      total_amount: total,
      currency: currency || 'USD',
      shipping_address: typeof shipping_address === 'string' ? shipping_address : JSON.stringify(shipping_address),
      status: 'pending',
      payment_method,
      notes,
    });

    // Return standardized success response
    return sendSuccess(
      res,
      order,
      'Order created successfully',
      201
    );
  })
);

// @route   GET /api/orders/me
// @desc    Get current user's orders
// @access  Private
router.get(
  '/me',
  authenticateJWT,
  asyncHandler(async (req: Request, res: Response) => {
    const user_id = (req as any).user?.id;
    
    if (!user_id) {
      throw new UnauthorizedError('Authentication required');
    }

    const orders = await OrderModel.findByUserId(user_id);
    
    return sendSuccess(res, orders, 'Orders retrieved successfully');
  })
);

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get(
  '/:id',
  authenticateJWT,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user_id = (req as any).user?.id;
    const user_role = (req as any).user?.role;

    const order = await OrderModel.findById(parseInt(id));
    
    if (!order) {
      throw new NotFoundError('Order not found', 'ORDER_NOT_FOUND');
    }

    // Check authorization - user owns order or is admin
    if (order.user_id !== user_id && user_role !== 'admin') {
      throw new UnauthorizedError('Not authorized to view this order', 'UNAUTHORIZED');
    }

    return sendSuccess(res, order, 'Order retrieved successfully');
  })
);

// @route   PATCH /api/orders/:id/status
// @desc    Update order status
// @access  Private (Vendor/Admin)
router.patch(
  '/:id/status',
  authenticateJWT,
  validate(schemas.order.updateStatus),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, tracking_number, carrier } = req.body;

    const updatedOrder = await OrderModel.updateStatus(parseInt(id), status);

    if (!updatedOrder) {
      throw new NotFoundError('Order not found', 'ORDER_NOT_FOUND');
    }

    // If status is shipped and tracking info provided, update it
    if (status === 'shipped' && tracking_number) {
      // Update tracking info logic here
    }

    return sendSuccess(res, updatedOrder, 'Order status updated successfully');
  })
);

// @route   PATCH /api/orders/:id/cancel
// @desc    Cancel an order
// @access  Private (Order Owner or Admin)
router.patch(
  '/:id/cancel',
  authenticateJWT,
  validate(schemas.order.cancel),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { reason, notes } = req.body;
    const user_id = (req as any).user?.id;

    // Get order
    const order = await OrderModel.findById(parseInt(id));
    
    if (!order) {
      throw new NotFoundError('Order not found', 'ORDER_NOT_FOUND');
    }

    // Check authorization
    if (order.user_id !== user_id) {
      throw new UnauthorizedError('Not authorized to cancel this order', 'UNAUTHORIZED');
    }

    // Check if order can be cancelled
    const cancellableStatuses = ['pending', 'paid', 'processing'];
    if (!cancellableStatuses.includes(order.status)) {
      throw new BadRequestError(
        `Cannot cancel order with status: ${order.status}`,
        'INVALID_STATUS',
        { currentStatus: order.status, cancellableStatuses }
      );
    }

    // Cancel order logic here
    const cancelledOrder = await OrderModel.updateStatus(parseInt(id), 'cancelled');

    return sendSuccess(res, cancelledOrder, 'Order cancelled successfully');
  })
);

export default router;
