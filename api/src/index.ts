import express from 'express';
import cors from 'cors';
import { planningRouter } from './routes/planning.js';
import { licenceRouter } from './routes/licence.js';
import { checkoutRouter } from './routes/checkout.js';
import { webhookRouter } from './routes/webhook.js';

const app = express();

// Middleware
app.use(cors());

// Stripe webhook needs raw body for signature verification
// Must be registered BEFORE express.json()
app.use('/webhook', express.raw({ type: 'application/json' }), webhookRouter);

// JSON parser for all other routes
app.use(express.json());

// Routes
app.use('/planning-applications', planningRouter);
app.use('/licence', licenceRouter);
app.use('/checkout', checkoutRouter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Export app for testing
export { app };

// Start server only if this is the main module
const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`PlanScope API running on http://localhost:${PORT}`);
    console.log(`Planning endpoint: http://localhost:${PORT}/planning-applications`);
  });
}
