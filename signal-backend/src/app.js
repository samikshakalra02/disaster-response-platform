const express = require('express');
const cors = require('cors');
const config = require('./config');
const authRoutes = require('./routes/auth.routes');
const alertsRoutes = require('./routes/alerts.routes');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: config.corsOrigins.length ? config.corsOrigins : true,
  })
);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'signal-dispatch-backend', time: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/alerts', alertsRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
