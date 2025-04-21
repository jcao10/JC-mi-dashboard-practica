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

// Obtener la consulta del argumento de línea de comandos
const query = process.argv[2];

if (!query) {
  console.error('Por favor, proporciona una consulta SQL como argumento');
  process.exit(1);
}

async function runQuery() {
  let client;
  try {
    console.log('Conectando a la base de datos...');
    client = await pool.connect();
    console.log('Host:', pool.options.host);
    console.log('Database:', pool.options.database);
    console.log('\nEjecutando query...\n');
    
    const result = await client.query(query);
    console.log('Resultados:\n');
    
    if (result.rows.length === 0) {
      console.log('No se encontraron resultados');
      return;
    }

    // Imprimir los nombres de las columnas
    const columns = Object.keys(result.rows[0]);
    console.log(columns.join('\t'));

    // Imprimir los datos
    result.rows.forEach(row => {
      const values = columns.map(col => row[col]);
      console.log(values.join('\t'));
    });
    
    return result.rows;
  } catch (error) {
    console.error('Error al ejecutar el query:', error);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

// Ejecutar la query
runQuery(); 