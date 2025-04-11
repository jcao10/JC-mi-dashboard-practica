import { QueryOptions, QueryFilter } from '../types/queries';

export class QueryService {
  public readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // Método para construir un query con filtros
  private buildQueryString(options: QueryOptions): string {
    const params = new URLSearchParams();

    // Agregar includes
    if (options.include?.length) {
      params.append('include', options.include.join(','));
    }

    // Agregar filtros
    if (options.filters?.length) {
      options.filters.forEach((filter, index) => {
        params.append(`filters[${index}][field]`, filter.field);
        params.append(`filters[${index}][operator]`, filter.operator);
        params.append(`filters[${index}][value]`, filter.value.toString());
      });
    }

    // Agregar ordenamiento
    if (options.sort) {
      params.append('sort[field]', options.sort.field);
      params.append('sort[direction]', options.sort.direction);
    }

    // Agregar paginación
    if (options.limit) {
      params.append('limit', options.limit.toString());
    }
    if (options.offset) {
      params.append('offset', options.offset.toString());
    }

    return params.toString();
  }

  // Método para obtener datos de copy_trades con relaciones
  async getCopyTrades(options: QueryOptions = {}) {
    const queryString = this.buildQueryString(options);
    const response = await fetch(`${this.baseUrl}/copy_trades?${queryString}`);
    return response.json();
  }

  // Método para obtener datos de msignals con relaciones
  async getMsignals(options: QueryOptions = {}) {
    const queryString = this.buildQueryString(options);
    const response = await fetch(`${this.baseUrl}/msignals?${queryString}`);
    return response.json();
  }

  // Método para obtener datos de channels con relaciones
  async getChannels(options: QueryOptions = {}) {
    const queryString = this.buildQueryString(options);
    const response = await fetch(`${this.baseUrl}/channels?${queryString}`);
    return response.json();
  }

  // Método para obtener datos de owners con relaciones
  async getOwners(options: QueryOptions = {}) {
    const queryString = this.buildQueryString(options);
    const response = await fetch(`${this.baseUrl}/owners?${queryString}`);
    return response.json();
  }

  // Método para obtener datos combinados
  async getCombinedData(options: QueryOptions = {}) {
    const [copyTrades, msignals, channels, owners] = await Promise.all([
      this.getCopyTrades(options),
      this.getMsignals(options),
      this.getChannels(options),
      this.getOwners(options)
    ]);

    return {
      copyTrades,
      msignals,
      channels,
      owners
    };
  }
}

// User Story:
// Como desarrollador, quiero tener un servicio que me permita construir y ejecutar queries
// complejos sobre las tablas relacionadas, para poder obtener y combinar datos de manera
// eficiente y flexible. 