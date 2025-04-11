import { QueryService } from '../services/queryService';
import { QueryOptions } from '../types/queries';

// Configuración del servicio
const queryService = new QueryService('http://localhost:3000/api');

// Ejemplo de query para obtener datos combinados
const testQuery = async () => {
  try {
    const queryOptions: QueryOptions = {
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

    console.log('Ejecutando query con opciones:');
    console.log(JSON.stringify(queryOptions, null, 2));
    console.log('\nConectando a:', queryService.baseUrl);
    
    const results = await queryService.getCombinedData(queryOptions);
    
    // Mostrar resultados formateados
    console.log('\nResultados del query:');
    console.log('=====================');
    
    console.log('\nCopy Trades:');
    console.log(JSON.stringify(results.copyTrades, null, 2));
    
    console.log('\nSeñales:');
    console.log(JSON.stringify(results.msignals, null, 2));
    
    console.log('\nCanales:');
    console.log(JSON.stringify(results.channels, null, 2));
    
    console.log('\nPropietarios:');
    console.log(JSON.stringify(results.owners, null, 2));

  } catch (error) {
    console.error('Error al ejecutar el query:', error);
  }
};

// Ejecutar el query
testQuery();

// User Story:
// Como desarrollador, quiero poder probar los queries desde la terminal
// para verificar que los datos se obtienen correctamente y que las relaciones
// entre las tablas funcionan como se espera. 