import pg from 'pg';
const { Pool } = pg;

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

// Query para obtener la estructura de las tablas
const queries = {
  copyTrades: `
    SELECT column_name, data_type, character_maximum_length
    FROM information_schema.columns
    WHERE table_name = 'copy_trades'
    ORDER BY ordinal_position;
  `,
  msignals: `
    SELECT column_name, data_type, character_maximum_length
    FROM information_schema.columns
    WHERE table_name = 'msignals'
    ORDER BY ordinal_position;
  `,
  owners: `
    SELECT column_name, data_type, character_maximum_length
    FROM information_schema.columns
    WHERE table_name = 'owners'
    ORDER BY ordinal_position;
  `,
  channels: `
    SELECT column_name, data_type, character_maximum_length
    FROM information_schema.columns
    WHERE table_name = 'channels'
    ORDER BY ordinal_position;
  `
};

async function checkTableStructure() {
  try {
    console.log('Conectando a la base de datos...');
    console.log('Host:', pool.options.host);
    console.log('Database:', pool.options.database);
    
    for (const [tableName, query] of Object.entries(queries)) {
      console.log(`\nEstructura de la tabla ${tableName}:`);
      console.log('='.repeat(40));
      
      const result = await pool.query(query);
      console.log(result.rows);
    }

  } catch (error) {
    console.error('Error al verificar la estructura:', error);
  } finally {
    await pool.end();
  }
}

// Ejecutar la verificación
checkTableStructure(); 