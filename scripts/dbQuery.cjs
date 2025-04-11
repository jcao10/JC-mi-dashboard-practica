const { Pool } = require('pg');

// Configuración de la conexión a PostgreSQL
const pool = new Pool({
  user: 'Luca-Juan',
  host: 'ec2-63-34-201-124.eu-west-1.compute.amazonaws.com',
  database: 'd2lg4pgrtrf0tl',
  password: 'pf5be8e12c2afc06c761a2a7c589caf0e594a3b8a0a207921bb40a60912aa083e',
  port: 5432,
  ssl: {
    rejectUnauthorized: false
  }
});

// Query original para obtener datos por canal
const queryByChannel = `
  SELECT 
    ms.owner_id as owner_id,
    u.username as owner_name,
    c.title as channel_title,
    COUNT(DISTINCT ms.id) as total_signals,
    COUNT(ct.id) as total_trades,
    ROUND(AVG(ct.pnl)::numeric, 2) as avg_trade_pnl,
    ROUND(SUM(ct.pnl)::numeric, 2) as total_pnl,
    COUNT(DISTINCT ct.exchange_name) as exchanges_used,
    ROUND(SUM(ct.qty)::numeric, 2) as total_qty
  FROM copy_trades ct
  LEFT JOIN msignals ms ON ct.msignal_id = ms.id
  LEFT JOIN owners o ON ms.owner_id = o.id
  LEFT JOIN users u ON o.user_id = u.id
  LEFT JOIN channels c ON o.channel_id = c.id
  WHERE ct.created_at >= '2025-04-01'
  GROUP BY ms.owner_id, u.username, c.title
  ORDER BY total_qty DESC;
`;

// Nuevo query para obtener total_qty por día de los últimos 7 días
const queryByDay = `
  SELECT 
    DATE(ct.created_at) as trade_date,
    ROUND(SUM(ct.qty)::numeric, 2) as daily_total_qty,
    COUNT(DISTINCT c.title) as total_channels,
    COUNT(ct.id) as total_trades
  FROM copy_trades ct
  LEFT JOIN msignals ms ON ct.msignal_id = ms.id
  LEFT JOIN owners o ON ms.owner_id = o.id
  LEFT JOIN channels c ON o.channel_id = c.id
  WHERE ct.created_at >= CURRENT_DATE - INTERVAL '8 days'
    AND ct.created_at < CURRENT_DATE
  GROUP BY DATE(ct.created_at)
  ORDER BY trade_date DESC;
`;

async function runQuery(queryType = 'byChannel') {
  let client;
  try {
    console.log('Conectando a la base de datos...');
    client = await pool.connect();
    console.log('Host:', pool.options.host);
    console.log('Database:', pool.options.database);
    console.log('\nEjecutando query...\n');
    
    const query = queryType === 'byChannel' ? queryByChannel : queryByDay;
    const result = await client.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error al ejecutar el query:', error);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
}

module.exports = {
  pool,
  queryByChannel,
  queryByDay,
  runQuery
}; 