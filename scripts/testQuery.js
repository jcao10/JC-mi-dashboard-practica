// Script para probar queries
const queryOptions = {
  include: ['msignals', 'owners', 'channels'],
  filters: [
    {
      field: 'created_at',
      operator: 'gte',
      value: '2024-01-01'
    }
  ],
  sort: {
    field: 'created_at',
    direction: 'desc'
  },
  limit: 5
};

// Función para construir el query string
function buildQueryString(options) {
  const params = new URLSearchParams();

  if (options.include?.length) {
    params.append('include', options.include.join(','));
  }

  if (options.filters?.length) {
    options.filters.forEach((filter, index) => {
      params.append(`filters[${index}][field]`, filter.field);
      params.append(`filters[${index}][operator]`, filter.operator);
      params.append(`filters[${index}][value]`, filter.value.toString());
    });
  }

  if (options.sort) {
    params.append('sort[field]', options.sort.field);
    params.append('sort[direction]', options.sort.direction);
  }

  if (options.limit) {
    params.append('limit', options.limit.toString());
  }
  if (options.offset) {
    params.append('offset', options.offset.toString());
  }

  return params.toString();
}

// Función para hacer las peticiones
async function fetchData(endpoint, options) {
  const baseUrl = 'http://localhost:3000/api';
  const queryString = buildQueryString(options);
  const url = `${baseUrl}/${endpoint}?${queryString}`;
  
  console.log(`\nHaciendo petición a: ${url}`);
  
  try {
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error(`Error al obtener datos de ${endpoint}:`, error);
    return null;
  }
}

// Función principal para ejecutar el test
async function runTest() {
  console.log('Opciones del query:');
  console.log(JSON.stringify(queryOptions, null, 2));

  try {
    const results = await Promise.all([
      fetchData('copy_trades', queryOptions),
      fetchData('msignals', queryOptions),
      fetchData('channels', queryOptions),
      fetchData('owners', queryOptions)
    ]);

    const [copyTrades, msignals, channels, owners] = results;

    console.log('\nResultados:');
    console.log('===========');

    console.log('\nCopy Trades:');
    console.log(JSON.stringify(copyTrades, null, 2));

    console.log('\nSeñales:');
    console.log(JSON.stringify(msignals, null, 2));

    console.log('\nCanales:');
    console.log(JSON.stringify(channels, null, 2));

    console.log('\nPropietarios:');
    console.log(JSON.stringify(owners, null, 2));

  } catch (error) {
    console.error('Error al ejecutar el test:', error);
  }
}

// Ejecutar el test
runTest();

const { runQuery } = require('./dbQuery.cjs');

async function testQueries() {
  try {
    console.log('=== Probando Query por Canal ===');
    const channelData = await runQuery('byChannel');
    console.log('Datos por canal:', JSON.stringify(channelData, null, 2));

    console.log('\n=== Probando Query por Día ===');
    const dayData = await runQuery('byDay');
    console.log('Datos por día:', JSON.stringify(dayData, null, 2));
  } catch (error) {
    console.error('Error en las pruebas:', error);
  }
}

testQueries(); 