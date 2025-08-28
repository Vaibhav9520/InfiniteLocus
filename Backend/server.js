import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { connectToDatabase } from './src/config/db.js';
import { Order } from './src/models/Order.js';
import { MenuItem } from './src/models/MenuItem.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({ origin: '*'}));
app.use(express.json());
app.use(morgan('dev'));

const ACTIVE_STATUSES = ['pending','confirmed','processing','active'];
const HISTORY_STATUSES = ['completed','cancelled','delivered','refunded'];

const api = express.Router();

api.get('/health', (_req, res) => res.json({ ok: true }));

// Menu CRUD
api.get('/menu', async (_req, res) => {
  const items = await MenuItem.find().sort({ createdAt: -1 }).lean();
  res.json(items);
});

api.post('/menu', async (req, res) => {
  try {
    const item = await MenuItem.create(req.body);
    res.status(201).json(item);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

api.get('/menu/:id', async (req, res) => {
  const item = await MenuItem.findById(req.params.id).lean();
  if (!item) return res.status(404).json({ message: 'Not found' });
  res.json(item);
});

api.put('/menu/:id', async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

api.delete('/menu/:id', async (req, res) => {
  const item = await MenuItem.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: 'Not found' });
  res.status(204).end();
});

// Orders with stock locking in a transaction
api.post('/orders', async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { userId, items } = req.body || {};
    if (!userId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'userId and items are required' });
    }

    session.startTransaction();

    const existingActive = await Order.findOne({ userId, status: { $in: ACTIVE_STATUSES } }).session(session);
    if (existingActive) {
      await session.abortTransaction();
      return res.status(409).json({ message: 'Active order already exists', order: existingActive });
    }

    // Lock stock: decrement per item
    for (const it of items) {
      const updated = await MenuItem.findOneAndUpdate(
        { _id: it.id, stock: { $gte: it.quantity || 1 } },
        { $inc: { stock: -(it.quantity || 1) } },
        { new: true, session }
      );
      if (!updated) {
        await session.abortTransaction();
        return res.status(400).json({ message: `Insufficient stock for item ${it.id}` });
      }
    }

    const now = new Date();
    const order = await Order.create([
      {
        userId,
        items: items.map(it => ({ id: String(it.id), name: it.name, price: it.price || 0, quantity: it.quantity || 1 })),
        status: 'pending',
        expiresAt: new Date(now.getTime() + 10 * 60 * 1000),
      }
    ], { session });

    await session.commitTransaction();
    res.status(201).json(order[0]);
  } catch (err) {
    try { await session.abortTransaction(); } catch {}
    console.error('POST /orders tx error', err);
    res.status(500).json({ message: 'Internal error' });
  } finally {
    session.endSession();
  }
});

api.post('/orders/:orderId/cancel', async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const { reason } = req.body || {};
    session.startTransaction();
    const order = await Order.findById(req.params.orderId).session(session);
    if (!order) { await session.abortTransaction(); return res.status(404).json({ message: 'Order not found' }); }
    if (order.status === 'cancelled' || order.status === 'completed' || order.status === 'delivered') {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Order not cancellable' });
    }

    // Restore stock
    for (const it of order.items) {
      await MenuItem.findByIdAndUpdate(it.id, { $inc: { stock: it.quantity } }, { session });
    }

    order.status = 'cancelled';
    order.cancelReason = reason || 'User cancelled';
    await order.save({ session });

    await session.commitTransaction();
    res.json(order);
  } catch (err) {
    try { await session.abortTransaction(); } catch {}
    console.error('CANCEL /orders error', err);
    res.status(500).json({ message: 'Internal error' });
  } finally {
    session.endSession();
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
  } catch (err) { return res.status(404).json({ message: 'Order not found' }); }
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

app.use('/api', api);

// Scheduler: auto-cancel expired orders every minute
setInterval(async () => {
  try {
    const now = new Date();
    const expired = await Order.find({ status: { $in: ACTIVE_STATUSES }, expiresAt: { $lte: now } });
    for (const order of expired) {
      const session = await mongoose.startSession();
      try {
        session.startTransaction();
        for (const it of order.items) {
          await MenuItem.findByIdAndUpdate(it.id, { $inc: { stock: it.quantity } }, { session });
        }
        order.status = 'cancelled';
        order.cancelReason = 'Auto-cancelled due to expiry';
        await order.save({ session });
        await session.commitTransaction();
      } catch (e) {
        try { await session.abortTransaction(); } catch {}
      } finally {
        session.endSession();
      }
    }
  } catch {}
}, 60 * 1000);

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
