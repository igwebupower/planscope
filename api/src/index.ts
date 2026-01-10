import express from 'express';
import cors from 'cors';
import { planningRouter } from './routes/planning.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/planning-applications', planningRouter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`PlanScope API running on http://localhost:${PORT}`);
  console.log(`Planning endpoint: http://localhost:${PORT}/planning-applications`);
});
