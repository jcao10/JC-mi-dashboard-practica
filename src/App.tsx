import React, { useState } from 'react';
import { QueryBuilder } from './components/QueryBuilder';
import './App.css';

function App() {
  const [queryResults, setQueryResults] = useState<any>(null);

  const handleQueryExecute = (data: any) => {
    setQueryResults(data);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Dashboard de Trading</h1>
      </header>
      
      <main>
        <QueryBuilder onQueryExecute={handleQueryExecute} />
        
        {queryResults && (
          <div className="results-section">
            <h2>Resultados</h2>
            <pre>{JSON.stringify(queryResults, null, 2)}</pre>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

// User Story:
// Como usuario del dashboard, quiero ver una interfaz principal que me permita
// construir queries y visualizar los resultados de manera clara y organizada,
// para poder analizar los datos de trading de manera efectiva. 