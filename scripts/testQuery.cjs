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

const query = `
  SELECT 
    DATE(ct.created_at) as trade_date,
    ct.exchange_name as exchange,
    ROUND(SUM(ct.qty)::numeric, 2) as daily_volume
  FROM copy_trades ct
  WHERE ct.created_at >= CURRENT_DATE - INTERVAL '30 days'
    AND ct.created_at < CURRENT_DATE
  GROUP BY DATE(ct.created_at), ct.exchange_name
  ORDER BY trade_date DESC, daily_volume DESC;
`;

async function testQuery() {
  let client;
  try {
    console.log('Conectando a la base de datos...');
    client = await pool.connect();
    console.log('Host:', pool.options.host);
    console.log('Database:', pool.options.database);
    console.log('\nEjecutando query...\n');
    
    const result = await client.query(query);
    console.log('Resultados:');
    console.log(JSON.stringify(result.rows, null, 2));
  } catch (error) {
    console.error('Error al ejecutar el query:', error);
  } finally {
    if (client) {
      client.release();
    }
    process.exit();
  }
}

testQuery(); 