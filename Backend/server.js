import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectToDatabase } from './src/config/db.js';
import { Order } from './src/models/Order.js';

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(helmet());
app.use(cors({ origin: '*'}));
app.use(express.json());
app.use(morgan('dev'));

const ACTIVE_STATUSES = ['pending','confirmed','processing','active'];
const HISTORY_STATUSES = ['completed','cancelled','delivered','refunded'];

const api = express.Router();

// Health
api.get('/health', (_req, res) => res.json({ ok: true }));

// Orders
api.post('/orders', async (req, res) => {
  try {
    const { userId, items } = req.body || {};
    if (!userId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'userId and items are required' });
    }

    const existingActive = await Order.findOne({ userId, status: { $in: ACTIVE_STATUSES } });
    if (existingActive) return res.status(409).json({ message: 'Active order already exists', order: existingActive });

    const now = new Date();
    const order = await Order.create({
      userId,
      items: items.map(it => ({ id: String(it.id), name: it.name, price: it.price || 0, quantity: it.quantity || 1 })),
      status: 'pending',
      expiresAt: new Date(now.getTime() + 15 * 60 * 1000),
    });

    return res.status(201).json(order);
  } catch (err) {
    console.error('POST /orders error', err);
    return res.status(500).json({ message: 'Internal error' });
  }
});

api.get('/orders/active', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: 'userId is required' });
    const order = await Order.findOne({ userId: String(userId), status: { $in: ACTIVE_STATUSES } });
    if (!order) return res.status(404).json({ message: 'No active order' });
    return res.json(order);
  } catch (err) {
    console.error('GET /orders/active error', err);
    return res.status(500).json({ message: 'Internal error' });
  }
});

api.get('/orders/history', async (req, res) => {
  try {
    const { userId, page = '1', limit = '10' } = req.query;
    if (!userId) return res.status(400).json({ message: 'userId is required' });
    const p = Math.max(parseInt(page, 10) || 1, 1);
    const l = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
    const orders = await Order.find({ userId: String(userId), status: { $in: HISTORY_STATUSES } })
      .sort({ createdAt: -1 })
      .skip((p - 1) * l)
      .limit(l)
      .lean();
    return res.json(orders);
  } catch (err) {
    console.error('GET /orders/history error', err);
    return res.status(500).json({ message: 'Internal error' });
  }
});

api.get('/orders/:orderId', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    return res.json(order);
  } catch (err) {
    return res.status(404).json({ message: 'Order not found' });
  }
});

api.put('/orders/:orderId/status', async (req, res) => {
  try {
    const { status, notes } = req.body || {};
    if (!status) return res.status(400).json({ message: 'status is required' });
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { $set: { status, notes } },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    return res.json(order);
  } catch (err) {
    console.error('PUT /orders/:orderId/status error', err);
    return res.status(500).json({ message: 'Internal error' });
  }
});

api.post('/orders/:orderId/cancel', async (req, res) => {
  try {
    const { reason } = req.body || {};
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { $set: { status: 'cancelled', cancelReason: reason || 'User cancelled' } },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    return res.json(order);
  } catch (err) {
    console.error('POST /orders/:orderId/cancel error', err);
    return res.status(500).json({ message: 'Internal error' });
  }
});

api.post('/orders/:orderId/items', async (req, res) => {
  try {
    const { items } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ message: 'items required' });
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    for (const item of items) {
      const id = String(item.id);
      const existing = order.items.find(i => i.id === id);
      if (existing) existing.quantity += item.quantity || 1;
      else order.items.push({ id, name: item.name, price: item.price || 0, quantity: item.quantity || 1 });
    }
    await order.save();
    return res.json(order);
  } catch (err) {
    console.error('POST /orders/:orderId/items error', err);
    return res.status(500).json({ message: 'Internal error' });
  }
});

api.delete('/orders/:orderId/items', async (req, res) => {
  try {
    const { itemIds } = req.body || {};
    if (!Array.isArray(itemIds) || itemIds.length === 0) return res.status(400).json({ message: 'itemIds required' });
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.items = order.items.filter(i => !itemIds.includes(i.id));
    await order.save();
    return res.json(order);
  } catch (err) {
    console.error('DELETE /orders/:orderId/items error', err);
    return res.status(500).json({ message: 'Internal error' });
  }
});

// Minimal menu endpoint (placeholder)
api.get('/menu', (_req, res) => {
  return res.json([]);
});

app.use('/api', api);

async function start() {
  try {
    await connectToDatabase();
    app.listen(PORT, () => {
      console.log(`API listening on http://localhost:${PORT}/api`);
    });
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();
