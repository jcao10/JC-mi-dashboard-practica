import React, { useState } from 'react';
import { QueryOptions, QueryFilter } from '../types/queries';
import { QueryService } from '../services/queryService';
import { config } from '../config';

interface QueryBuilderProps {
  onQueryExecute: (data: any) => void;
}

export const QueryBuilder: React.FC<QueryBuilderProps> = ({ onQueryExecute }) => {
  const [queryOptions, setQueryOptions] = useState<QueryOptions>({
    include: [],
    filters: [],
    sort: { field: 'id', direction: 'desc' },
    limit: 10,
    offset: 0
  });

  const queryService = new QueryService(config.apiUrl);

  const handleAddFilter = () => {
    setQueryOptions(prev => ({
      ...prev,
      filters: [...(prev.filters || []), { field: '', operator: 'eq', value: '' }]
    }));
  };

  const handleFilterChange = (index: number, field: keyof QueryFilter, value: any) => {
    setQueryOptions(prev => ({
      ...prev,
      filters: prev.filters?.map((filter, i) => 
        i === index ? { ...filter, [field]: value } : filter
      )
    }));
  };

  const handleExecuteQuery = async () => {
    try {
      const data = await queryService.getCombinedData(queryOptions);
      onQueryExecute(data);
    } catch (error) {
      console.error('Error executing query:', error);
    }
  };

  return (
    <div className="query-builder">
      <h2>Constructor de Queries</h2>
      
      <div className="filters-section">
        <h3>Filtros</h3>
        {queryOptions.filters?.map((filter, index) => (
          <div key={index} className="filter-row">
            <select
              value={filter.field}
              onChange={(e) => handleFilterChange(index, 'field', e.target.value)}
            >
              <option value="">Seleccionar campo</option>
              <option value="id">ID</option>
              <option value="created_at">Fecha de creación</option>
              <option value="status">Estado</option>
            </select>
            
            <select
              value={filter.operator}
              onChange={(e) => handleFilterChange(index, 'operator', e.target.value)}
            >
              <option value="eq">Igual a</option>
              <option value="neq">No igual a</option>
              <option value="gt">Mayor que</option>
              <option value="lt">Menor que</option>
              <option value="gte">Mayor o igual que</option>
              <option value="lte">Menor o igual que</option>
              <option value="contains">Contiene</option>
            </select>
            
            <input
              type="text"
              value={filter.value}
              onChange={(e) => handleFilterChange(index, 'value', e.target.value)}
              placeholder="Valor"
            />
          </div>
        ))}
        <button onClick={handleAddFilter}>Agregar Filtro</button>
      </div>

      <div className="sort-section">
        <h3>Ordenamiento</h3>
        <select
          value={queryOptions.sort?.field}
          onChange={(e) => setQueryOptions(prev => ({
            ...prev,
            sort: { ...prev.sort!, field: e.target.value }
          }))}
        >
          <option value="id">ID</option>
          <option value="created_at">Fecha de creación</option>
        </select>
        
        <select
          value={queryOptions.sort?.direction}
          onChange={(e) => setQueryOptions(prev => ({
            ...prev,
            sort: { ...prev.sort!, direction: e.target.value as 'asc' | 'desc' }
          }))}
        >
          <option value="asc">Ascendente</option>
          <option value="desc">Descendente</option>
        </select>
      </div>

      <div className="pagination-section">
        <h3>Paginación</h3>
        <input
          type="number"
          value={queryOptions.limit}
          onChange={(e) => setQueryOptions(prev => ({
            ...prev,
            limit: parseInt(e.target.value)
          }))}
          placeholder="Límite"
        />
        
        <input
          type="number"
          value={queryOptions.offset}
          onChange={(e) => setQueryOptions(prev => ({
            ...prev,
            offset: parseInt(e.target.value)
          }))}
          placeholder="Offset"
        />
      </div>

      <button onClick={handleExecuteQuery}>Ejecutar Query</button>
    </div>
  );
};

// User Story:
// Como usuario del dashboard, quiero tener una interfaz visual para construir queries
// complejos que me permita filtrar, ordenar y paginar los datos de trades, señales,
// canales y propietarios, para poder analizar la información de manera efectiva. 