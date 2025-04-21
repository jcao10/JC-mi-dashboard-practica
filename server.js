const express = require('express');
const cors = require('cors');
const path = require('path');
const { runQuery } = require('./scripts/dbQuery.cjs');

const app = express();
const port = 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Servir archivos estáticos desde la carpeta dist (generada por Vite)
app.use(express.static(path.join(__dirname, 'dist'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

// Ruta para obtener los datos de la consulta por canal
app.get('/api/query-by-channel', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const data = await runQuery('byChannel', startDate, endDate);
    res.json(data);
  } catch (err) {
    console.error('Error en query-by-channel:', err);
    res.status(500).json({ error: err.message });
  }
});

// Ruta para obtener los datos de la consulta por día
app.get('/api/query-by-day', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const data = await runQuery('byDay', startDate, endDate);
    res.json(data);
  } catch (err) {
    console.error('Error en query-by-day:', err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint para obtener volumen por exchange
app.get('/api/query-volume-by-exchange', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const data = await runQuery('volumeByExchange', startDate, endDate);
    res.json(data);
  } catch (err) {
    console.error('Error en query-volume-by-exchange:', err);
    res.status(500).json({ error: err.message });
  }
});

// Manejar rutas SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
}); 