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
app.use(express.static(path.join(__dirname, 'dist')));

// Ruta para obtener los datos de la consulta por canal
app.get('/api/query', async (req, res) => {
  try {
    console.log('Ejecutando consulta por canal...');
    const data = await runQuery('byChannel');
    console.log('Consulta ejecutada exitosamente');
    res.json(data);
  } catch (err) {
    console.error('Error detallado:', {
      message: err.message,
      code: err.code,
      detail: err.detail,
      hint: err.hint,
      position: err.position,
      where: err.where
    });
    res.status(500).json({ 
      error: 'Error al obtener los datos',
      details: err.message,
      code: err.code
    });
  }
});

// Ruta para obtener los datos de la consulta por día
app.get('/api/query-by-day', async (req, res) => {
  try {
    console.log('Ejecutando consulta por día...');
    const data = await runQuery('byDay');
    console.log('Consulta ejecutada exitosamente');
    res.json(data);
  } catch (err) {
    console.error('Error detallado:', {
      message: err.message,
      code: err.code,
      detail: err.detail,
      hint: err.hint,
      position: err.position,
      where: err.where
    });
    res.status(500).json({ 
      error: 'Error al obtener los datos',
      details: err.message,
      code: err.code
    });
  }
});

// Manejar todas las rutas no definidas para soportar el enrutamiento del cliente
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
}); 