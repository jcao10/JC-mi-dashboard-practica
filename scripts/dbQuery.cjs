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
    ROUND(SUM(
      (
        SELECT COALESCE(SUM(o.qty * o.price), 0)
        FROM orders o
        WHERE o.copy_trade_id = ct.id
        AND o.status = 3
      )
    )::numeric, 2) as total_qty
  FROM copy_trades ct
  LEFT JOIN msignals ms ON ct.msignal_id = ms.id
  LEFT JOIN owners o ON ms.owner_id = o.id
  LEFT JOIN users u ON o.user_id = u.id
  LEFT JOIN channels c ON o.channel_id = c.id
  WHERE ct.created_at >= '2025-01-01'
  GROUP BY ms.owner_id, u.username, c.title
  ORDER BY total_qty DESC;
`;

// Query para obtener datos diarios
const queryDaily = `
  SELECT 
    DATE(ct.created_at) as date,
    COUNT(DISTINCT ms.id) as total_signals,
    COUNT(ct.id) as total_trades,
    ROUND(AVG(ct.pnl)::numeric, 2) as avg_trade_pnl,
    ROUND(SUM(ct.pnl)::numeric, 2) as total_pnl,
    COUNT(DISTINCT ct.exchange_name) as exchanges_used,
    ROUND(SUM(
      (
        SELECT COALESCE(SUM(o.qty * o.price), 0)
        FROM orders o
        WHERE o.copy_trade_id = ct.id
        AND o.status = 3
      )
    )::numeric, 2) as daily_total_qty
  FROM copy_trades ct
  LEFT JOIN msignals ms ON ct.msignal_id = ms.id
  WHERE ct.created_at >= '2025-01-01'
  GROUP BY DATE(ct.created_at)
  ORDER BY date DESC;
`;

// Query para obtener datos por exchange
const queryByExchange = `
  SELECT 
    ct.exchange_name,
    COUNT(DISTINCT ms.id) as total_signals,
    COUNT(ct.id) as total_trades,
    ROUND(AVG(ct.pnl)::numeric, 2) as avg_trade_pnl,
    ROUND(SUM(ct.pnl)::numeric, 2) as total_pnl,
    COUNT(DISTINCT ms.owner_id) as owners_count,
    ROUND(SUM(
      (
        SELECT COALESCE(SUM(o.qty * o.price), 0)
        FROM orders o
        WHERE o.copy_trade_id = ct.id
        AND o.status = 3
      )
    )::numeric, 2) as total_qty
  FROM copy_trades ct
  LEFT JOIN msignals ms ON ct.msignal_id = ms.id
  WHERE ct.created_at >= '2025-01-01'
  GROUP BY ct.exchange_name
  ORDER BY total_qty DESC;
`;

// Query para obtener datos por día
const queryByDay = `
  SELECT 
    DATE(ct.created_at) as trade_date,
    ROUND(SUM(
      (
        SELECT COALESCE(SUM(o.qty * o.price), 0)
        FROM orders o
        WHERE o.copy_trade_id = ct.id
        AND o.status = 3
      )
    )::numeric, 2) as daily_total_qty,
    COUNT(DISTINCT c.title) as total_channels,
    COUNT(ct.id) as total_trades
  FROM copy_trades ct
  LEFT JOIN msignals ms ON ct.msignal_id = ms.id
  LEFT JOIN owners o ON ms.owner_id = o.id
  LEFT JOIN channels c ON o.channel_id = c.id
  WHERE ct.created_at >= '2025-01-01'
    AND ct.created_at < CURRENT_DATE
  GROUP BY DATE(ct.created_at)
  ORDER BY trade_date DESC;
`;

// Query para obtener volumen diario por exchange
const queryVolumeByExchange = `
  SELECT 
    DATE(ct.created_at) as trade_date,
    ct.exchange_name as exchange,
    ROUND(SUM(
      (
        SELECT COALESCE(SUM(o.qty * o.price), 0)
        FROM orders o
        WHERE o.copy_trade_id = ct.id
        AND o.status = 3
      )
    )::numeric, 2) as daily_volume
  FROM copy_trades ct
  WHERE ct.created_at >= '2025-01-01'
    AND ct.created_at < CURRENT_DATE
  GROUP BY DATE(ct.created_at), ct.exchange_name
  ORDER BY trade_date DESC, daily_volume DESC;
`;

// Query para obtener AUM diario de los últimos 7 días
const queryAUM = `
  SELECT 
    DATE(m.created_at) as trade_date,
    ROUND(SUM(m.aum)::numeric, 2) as daily_aum,
    COUNT(DISTINCT c.title) as total_channels,
    COUNT(DISTINCT o.user_id) as total_owners
  FROM metrics m
  LEFT JOIN channels c ON m.channel_id = c.id
  LEFT JOIN owners o ON c.id = o.channel_id
  WHERE m.created_at >= CURRENT_DATE - INTERVAL '7 days'
    AND m.created_at < CURRENT_DATE
  GROUP BY DATE(m.created_at)
  ORDER BY trade_date DESC;
`;

// Query para obtener AUM por dueño en el último día
const queryAUMByOwner = `
  WITH last_day_metrics AS (
    SELECT 
      m.channel_id,
      m.aum
    FROM metrics m
    WHERE m.created_at = (
      SELECT MAX(created_at)
      FROM metrics
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
        AND created_at < CURRENT_DATE
    )
  )
  SELECT 
    u.id as owner_id,
    u.username as owner_name,
    u.email as owner_email,
    COUNT(DISTINCT c.id) as total_channels,
    ROUND(SUM(ldm.aum)::numeric, 2) as last_day_aum
  FROM last_day_metrics ldm
  LEFT JOIN channels c ON ldm.channel_id = c.id
  LEFT JOIN owners o ON c.id = o.channel_id
  LEFT JOIN users u ON o.user_id = u.id
  GROUP BY u.id, u.username, u.email
  ORDER BY last_day_aum DESC;
`;

// Query para listar las tablas de la base de datos
const listTablesQuery = `
  SELECT table_name 
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  ORDER BY table_name;
`;

// Query para ver la estructura de la tabla balances
const describeBalancesQuery = `
  SELECT column_name, data_type, character_maximum_length
  FROM information_schema.columns
  WHERE table_name = 'balances'
  ORDER BY ordinal_position;
`;

// Query para ver la estructura de la tabla funds
const describeFundsQuery = `
  SELECT column_name, data_type, character_maximum_length
  FROM information_schema.columns
  WHERE table_name = 'funds'
  ORDER BY ordinal_position;
`;

// Query para ver la estructura de la tabla metrics
const describeMetricsQuery = `
  SELECT column_name, data_type, character_maximum_length
  FROM information_schema.columns
  WHERE table_name = 'metrics'
  ORDER BY ordinal_position;
`;

// Query para ver la estructura de la tabla owners
const describeOwnersQuery = `
  SELECT column_name, data_type, character_maximum_length
  FROM information_schema.columns
  WHERE table_name = 'owners'
  ORDER BY ordinal_position;
`;

// Query para obtener información del dueño de un canal específico
const queryChannelOwner = `
  SELECT 
    c.id as channel_id,
    c.title as channel_name,
    u.id as user_id,
    u.email as user_email,
    u.username as user_name,
    COUNT(DISTINCT c2.id) as total_channels_owned
  FROM channels c
  LEFT JOIN owners o ON c.id = o.channel_id
  LEFT JOIN users u ON o.user_id = u.id
  LEFT JOIN owners o2 ON u.id = o2.user_id
  LEFT JOIN channels c2 ON o2.channel_id = c2.id
  WHERE c.title = 'SmartPortfolio - ZigmaCapital'
  GROUP BY c.id, c.title, u.id, u.email, u.username;
`;

// Query para obtener todos los canales de un usuario específico
const queryUserChannels = `
  SELECT 
    c.id as channel_id,
    c.title as channel_name,
    c.created_at as channel_created_at
  FROM channels c
  LEFT JOIN owners o ON c.id = o.channel_id
  LEFT JOIN users u ON o.user_id = u.id
  WHERE u.id = 3289
  ORDER BY c.created_at DESC;
`;

const buildQueryByChannel = (startDate, endDate) => `
  SELECT 
    ms.owner_id as owner_id,
    u.username as owner_name,
    c.title as channel_title,
    COUNT(DISTINCT ms.id) as total_signals,
    COUNT(ct.id) as total_trades,
    ROUND(AVG(ct.pnl)::numeric, 2) as avg_trade_pnl,
    ROUND(SUM(ct.pnl)::numeric, 2) as total_pnl,
    COUNT(DISTINCT ct.exchange_name) as exchanges_used,
    ROUND(SUM(
      (
        SELECT COALESCE(SUM(o.qty * o.price), 0)
        FROM orders o
        WHERE o.copy_trade_id = ct.id
        AND o.status = 3
      )
    )::numeric, 2) as total_qty
  FROM copy_trades ct
  LEFT JOIN msignals ms ON ct.msignal_id = ms.id
  LEFT JOIN owners o ON ms.owner_id = o.id
  LEFT JOIN users u ON o.user_id = u.id
  LEFT JOIN channels c ON o.channel_id = c.id
  WHERE ct.created_at >= '${startDate}'
    AND ct.created_at <= '${endDate}'
  GROUP BY ms.owner_id, u.username, c.title
  ORDER BY total_qty DESC;
`;

const buildQueryByDay = (startDate, endDate) => `
  SELECT 
    DATE(ct.created_at) as trade_date,
    ROUND(SUM(
      (
        SELECT COALESCE(SUM(o.qty * o.price), 0)
        FROM orders o
        WHERE o.copy_trade_id = ct.id
        AND o.status = 3
      )
    )::numeric, 2) as total_qty,
    COUNT(DISTINCT ct.exchange_name) as total_channels,
    COUNT(ct.id) as total_trades
  FROM copy_trades ct
  WHERE ct.created_at >= '${startDate}'
    AND ct.created_at <= '${endDate}'
  GROUP BY DATE(ct.created_at)
  ORDER BY trade_date DESC;
`;

const buildQueryVolumeByExchange = (startDate, endDate) => `
  SELECT 
    DATE(ct.created_at) as trade_date,
    ct.exchange_name as exchange,
    ROUND(SUM(
      (
        SELECT COALESCE(SUM(o.qty * o.price), 0)
        FROM orders o
        WHERE o.copy_trade_id = ct.id
        AND o.status = 3
      )
    )::numeric, 2) as daily_volume
  FROM copy_trades ct
  WHERE ct.created_at >= '${startDate}'
    AND ct.created_at <= '${endDate}'
  GROUP BY DATE(ct.created_at), ct.exchange_name
  ORDER BY trade_date DESC, daily_volume DESC;
`;

async function runQuery(queryType = 'byChannel', startDate, endDate) {
  let client;
  try {
    console.log('Conectando a la base de datos...');
    client = await pool.connect();
    console.log('Host:', pool.options.host);
    console.log('Database:', pool.options.database);
    console.log('\nEjecutando query...\n');
    
    let query;
    
    switch (queryType) {
      case 'byChannel':
        query = buildQueryByChannel(startDate, endDate);
        break;
      case 'byDay':
        query = buildQueryByDay(startDate, endDate);
        break;
      case 'volumeByExchange':
        query = buildQueryVolumeByExchange(startDate, endDate);
        break;
      default:
        throw new Error('Tipo de query no válido');
    }

    const result = await client.query(query);
    console.log('Resultados:');
    console.log(JSON.stringify(result.rows, null, 2));
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

async function listTables() {
  let client;
  try {
    console.log('Conectando a la base de datos...');
    client = await pool.connect();
    console.log('Host:', pool.options.host);
    console.log('Database:', pool.options.database);
    console.log('\nListando tablas...\n');
    
    const result = await client.query(listTablesQuery);
    return result.rows;
  } catch (error) {
    console.error('Error al listar tablas:', error);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
}

async function describeBalances() {
  let client;
  try {
    console.log('Conectando a la base de datos...');
    client = await pool.connect();
    console.log('Host:', pool.options.host);
    console.log('Database:', pool.options.database);
    console.log('\nDescribiendo tabla balances...\n');
    
    const result = await client.query(describeBalancesQuery);
    return result.rows;
  } catch (error) {
    console.error('Error al describir tabla:', error);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
}

async function describeFunds() {
  let client;
  try {
    console.log('Conectando a la base de datos...');
    client = await pool.connect();
    console.log('Host:', pool.options.host);
    console.log('Database:', pool.options.database);
    console.log('\nDescribiendo tabla funds...\n');
    
    const result = await client.query(describeFundsQuery);
    return result.rows;
  } catch (error) {
    console.error('Error al describir tabla:', error);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
}

async function describeMetrics() {
  let client;
  try {
    console.log('Conectando a la base de datos...');
    client = await pool.connect();
    console.log('Host:', pool.options.host);
    console.log('Database:', pool.options.database);
    console.log('\nDescribiendo tabla metrics...\n');
    
    const result = await client.query(describeMetricsQuery);
    return result.rows;
  } catch (error) {
    console.error('Error al describir tabla:', error);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
}

async function describeOwners() {
  let client;
  try {
    console.log('Conectando a la base de datos...');
    client = await pool.connect();
    console.log('Host:', pool.options.host);
    console.log('Database:', pool.options.database);
    console.log('\nDescribiendo tabla owners...\n');
    
    const result = await client.query(describeOwnersQuery);
    return result.rows;
  } catch (error) {
    console.error('Error al describir tabla:', error);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
}

async function getChannelOwner() {
  let client;
  try {
    console.log('Conectando a la base de datos...');
    client = await pool.connect();
    console.log('Host:', pool.options.host);
    console.log('Database:', pool.options.database);
    console.log('\nBuscando información del dueño del canal...\n');
    
    const result = await client.query(queryChannelOwner);
    return result.rows;
  } catch (error) {
    console.error('Error al buscar información del dueño:', error);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
}

async function getUserChannels() {
  let client;
  try {
    console.log('Conectando a la base de datos...');
    client = await pool.connect();
    console.log('Host:', pool.options.host);
    console.log('Database:', pool.options.database);
    console.log('\nBuscando canales del usuario...\n');
    
    const result = await client.query(queryUserChannels);
    return result.rows;
  } catch (error) {
    console.error('Error al buscar canales del usuario:', error);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
}

async function getAUMByOwner() {
  let client;
  try {
    console.log('Conectando a la base de datos...');
    client = await pool.connect();
    console.log('Host:', pool.options.host);
    console.log('Database:', pool.options.database);
    console.log('\nBuscando AUM por dueño...\n');
    
    const result = await client.query(queryAUMByOwner);
    return result.rows;
  } catch (error) {
    console.error('Error al buscar AUM por dueño:', error);
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
  queryDaily,
  queryByExchange,
  queryByDay,
  queryAUM,
  runQuery,
  listTables,
  describeBalances,
  describeFunds,
  describeMetrics,
  describeOwners,
  getChannelOwner,
  getUserChannels,
  getAUMByOwner
}; 