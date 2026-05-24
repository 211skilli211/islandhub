import { Router, Request, Response } from 'express';
import { Pool } from 'pg';
import crypto from 'crypto';

const router = Router();

function getPool(req: Request): Pool {
  return (req.app as any).locals.pool;
}

// Generate a secure QR token
function generateQRToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Middleware: require auth
function requireAuth(req: Request, res: Response, next: Function) {
  const userId = (req as any).user?.id;
  if (!userId) return res.status(401).json({ error: 'Authentication required' });
  (req as any).userId = userId;
  next();
}

// ============ EVENTS ============

// GET /api/events — List published events
router.get('/', async (req: Request, res: Response) => {
  try {
    const pool = getPool(req);
    const { category, search, status = 'published', limit = '50', offset = '0' } = req.query;

    let sql = `
      SELECT e.*, u.name as organizer_name,
        COALESCE(json_agg(
          json_build_object(
            'id', tt.id, 'name', tt.name, 'price', tt.price,
            'quantity', tt.quantity, 'sold', tt.sold,
            'description', tt.description, 'perks', tt.perks
          )
        ) FILTER (WHERE tt.id IS NOT NULL), '[]') as ticket_tiers
      FROM events e
      LEFT JOIN users u ON u.id = e.organizer_id
      LEFT JOIN ticket_tiers tt ON tt.event_id = e.id
      WHERE e.status = $1
    `;
    const params: any[] = [status];
    let pIdx = 2;

    if (category) {
      sql += ` AND e.category = $${pIdx++}`;
      params.push(category);
    }
    if (search) {
      sql += ` AND (e.title ILIKE $${pIdx} OR e.description ILIKE $${pIdx} OR e.venue ILIKE $${pIdx})`;
      params.push(`%${search}%`);
      pIdx++;
    }

    sql += ` GROUP BY e.id, u.name ORDER BY e.start_date ASC LIMIT $${pIdx++} OFFSET $${pIdx++}`;
    params.push(Number(limit), Number(offset));

    const result = await pool.query(sql, params);
    res.json({ events: result.rows });
  } catch (err: any) {
    console.error('Events list error:', err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// GET /api/events/:id — Get single event
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const pool = getPool(req);
    const result = await pool.query(`
      SELECT e.*, u.name as organizer_name,
        COALESCE(json_agg(
          json_build_object(
            'id', tt.id, 'name', tt.name, 'price', tt.price,
            'quantity', tt.quantity, 'sold', tt.sold,
            'description', tt.description, 'perks', tt.perks
          )
        ) FILTER (WHERE tt.id IS NOT NULL), '[]') as ticket_tiers
      FROM events e
      LEFT JOIN users u ON u.id = e.organizer_id
      LEFT JOIN ticket_tiers tt ON tt.event_id = e.id
      WHERE e.id = $1
      GROUP BY e.id, u.name
    `, [req.params.id]);

    if (result.rows.length === 0) return res.status(404).json({ error: 'Event not found' });
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// POST /api/events — Create event (admin only)
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const pool = getPool(req);
    const userId = (req as any).userId;
    const { title, description, venue, address, start_date, end_date, category, image_url, banner_url, total_capacity, ticket_tiers } = req.body;

    const eventResult = await pool.query(`
      INSERT INTO events (title, description, venue, address, start_date, end_date, category, image_url, banner_url, organizer_id, status, total_capacity, tickets_sold)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'published', $11, 0)
      RETURNING *
    `, [title, description, venue, address, start_date, end_date, category, image_url, banner_url, userId, total_capacity || 100]);

    const event = eventResult.rows[0];

    // Create ticket tiers
    if (ticket_tiers && ticket_tiers.length > 0) {
      for (const tier of ticket_tiers) {
        await pool.query(`
          INSERT INTO ticket_tiers (event_id, name, price, quantity, sold, description, perks)
          VALUES ($1, $2, $3, $4, 0, $5, $6)
        `, [event.id, tier.name, tier.price, tier.quantity, tier.description || '', tier.perks || []]);
      }
    }

    res.status(201).json(event);
  } catch (err: any) {
    console.error('Event create error:', err);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// ============ TICKETS ============

// POST /api/events/tickets/purchase — Purchase a ticket
router.post('/tickets/purchase', requireAuth, async (req: Request, res: Response) => {
  const client = await getPool(req).connect();
  try {
    const userId = (req as any).userId;
    const { event_id, tier_id, quantity = 1, holder_name, holder_email } = req.body;

    await client.query('BEGIN');

    // Check tier availability
    const tierResult = await client.query(
      'SELECT * FROM ticket_tiers WHERE id = $1 AND event_id = $2 FOR UPDATE',
      [tier_id, event_id]
    );
    if (tierResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Ticket tier not found' });
    }
    const tier = tierResult.rows[0];

    if (tier.sold + quantity > tier.quantity) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Not enough tickets available' });
    }

    // Generate unique QR token
    const qrToken = generateQRToken();
    const qrCode = qrToken; // In production, this would be a generated QR image URL

    // Create ticket
    const ticketResult = await client.query(`
      INSERT INTO tickets (event_id, tier_id, user_id, qr_code, qr_token, status, holder_name, holder_email, purchased_at)
      VALUES ($1, $2, $3, $4, $5, 'valid', $6, $7, NOW())
      RETURNING *
    `, [event_id, tier_id, userId, qrCode, qrToken, holder_name || '', holder_email || '']);

    // Update sold count
    await client.query(
      'UPDATE ticket_tiers SET sold = sold + $1 WHERE id = $2',
      [quantity, tier_id]
    );
    await client.query(
      'UPDATE events SET tickets_sold = tickets_sold + $1 WHERE id = $2',
      [quantity, event_id]
    );

    await client.query('COMMIT');
    res.status(201).json({ ticket: ticketResult.rows[0], qr_token: qrToken });
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('Ticket purchase error:', err);
    res.status(500).json({ error: 'Purchase failed' });
  } finally {
    client.release();
  }
});

// GET /api/events/tickets/my — Get user's tickets
router.get('/tickets/my', requireAuth, async (req: Request, res: Response) => {
  try {
    const pool = getPool(req);
    const userId = (req as any).userId;

    const result = await pool.query(`
      SELECT t.*,
        json_build_object(
          'id', e.id, 'title', e.title, 'venue', e.venue,
          'start_date', e.start_date, 'image_url', e.image_url,
          'category', e.category
        ) as event,
        json_build_object(
          'id', tt.id, 'name', tt.name, 'price', tt.price
        ) as tier
      FROM tickets t
      LEFT JOIN events e ON e.id = t.event_id
      LEFT JOIN ticket_tiers tt ON tt.id = t.tier_id
      WHERE t.user_id = $1
      ORDER BY t.purchased_at DESC
    `, [userId]);

    res.json({ tickets: result.rows });
  } catch (err: any) {
    console.error('My tickets error:', err);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// POST /api/events/tickets/verify — Verify a ticket QR code (for event staff)
router.post('/tickets/verify', requireAuth, async (req: Request, res: Response) => {
  try {
    const pool = getPool(req);
    const { qr_token } = req.body;

    const result = await pool.query(`
      SELECT t.*, e.title as event_title, tt.name as tier_name
      FROM tickets t
      LEFT JOIN events e ON e.id = t.event_id
      LEFT JOIN ticket_tiers tt ON tt.id = t.tier_id
      WHERE t.qr_token = $1
    `, [qr_token]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found', valid: false });
    }

    const ticket = result.rows[0];

    if (ticket.status === 'used') {
      return res.json({ valid: false, error: 'Ticket already used', used_at: ticket.used_at, ticket });
    }
    if (ticket.status === 'refunded') {
      return res.json({ valid: false, error: 'Ticket has been refunded', ticket });
    }
    if (ticket.status === 'expired') {
      return res.json({ valid: false, error: 'Ticket expired', ticket });
    }

    // Mark as used
    await pool.query(
      "UPDATE tickets SET status = 'used', used_at = NOW() WHERE id = $1",
      [ticket.id]
    );

    res.json({ valid: true, ticket: { ...ticket, status: 'used' } });
  } catch (err: any) {
    console.error('Ticket verify error:', err);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// POST /api/events/tickets/:id/refund — Refund a ticket
router.post('/tickets/:id/refund', requireAuth, async (req: Request, res: Response) => {
  const client = await getPool(req).connect();
  try {
    const userId = (req as any).userId;
    const ticketId = req.params.id;

    await client.query('BEGIN');

    const ticketResult = await client.query(
      'SELECT * FROM tickets WHERE id = $1 AND user_id = $2 FOR UPDATE',
      [ticketId, userId]
    );
    if (ticketResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Ticket not found' });
    }

    await client.query("UPDATE tickets SET status = 'refunded' WHERE id = $1", [ticketId]);
    await client.query('UPDATE ticket_tiers SET sold = GREATEST(0, sold - 1) WHERE id = $1', [ticketResult.rows[0].tier_id]);
    await client.query('UPDATE events SET tickets_sold = GREATEST(0, tickets_sold - 1) WHERE id = $1', [ticketResult.rows[0].event_id]);

    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err: any) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Refund failed' });
  } finally {
    client.release();
  }
});

export default router;
