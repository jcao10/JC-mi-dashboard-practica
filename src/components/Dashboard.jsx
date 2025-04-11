import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { 
  Container, 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Tabs,
  Tab
} from '@mui/material';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewType, setViewType] = useState('byChannel');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const endpoint = viewType === 'byChannel' ? '/api/query' : '/api/query-by-day';
        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setData(result);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [viewType]);

  const handleTabChange = (event, newValue) => {
    console.log('Cambiando vista a:', newValue);
    setViewType(newValue);
  };

  if (loading) return <div className="loading">Cargando datos...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!data || data.length === 0) return <div>No hay datos disponibles</div>;

  console.log('Datos actuales:', data);
  console.log('Tipo de vista actual:', viewType);

  // Para la vista por día, no necesitamos invertir los datos ya que ya vienen ordenados
  const chartData = {
    labels: data.map(item => new Date(item.trade_date).toLocaleDateString()),
    datasets: [
      {
        label: 'Cantidad Total por Día',
        data: data.map(item => item.daily_total_qty),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Cantidad Total por Día',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Cantidad Total',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Fecha',
        },
      },
    },
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard de Trading
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={viewType} onChange={handleTabChange}>
            <Tab label="Vista por Canal" value="byChannel" />
            <Tab label="Vista por Día" value="byDay" />
          </Tabs>
        </Box>

        {viewType === 'byChannel' ? (
          <Box>
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                XXX - Explicación de las Métricas
              </Typography>
              <ul>
                <li><strong>Total Señales:</strong> Número total de señales generadas por el canal.</li>
                <li><strong>Total Trades:</strong> Número total de operaciones realizadas.</li>
                <li><strong>PNL Promedio:</strong> Beneficio/pérdida promedio por operación.</li>
                <li><strong>PNL Total:</strong> Beneficio/pérdida total acumulado.</li>
                <li><strong>Exchanges Usados:</strong> Número de exchanges diferentes utilizados.</li>
                <li><strong>Cantidad Total:</strong> Volumen total operado en todas las operaciones.</li>
              </ul>
              <Typography variant="body2" color="text.secondary">
                Nota: Los datos se muestran desde el 1 de abril de 2025.
              </Typography>
            </Paper>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Canal</TableCell>
                    <TableCell align="right">Total Señales</TableCell>
                    <TableCell align="right">Total Trades</TableCell>
                    <TableCell align="right">PNL Promedio</TableCell>
                    <TableCell align="right">PNL Total</TableCell>
                    <TableCell align="right">Exchanges Usados</TableCell>
                    <TableCell align="right">Cantidad Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.channel_title || 'N/A'}</TableCell>
                      <TableCell align="right">{item.total_signals || 0}</TableCell>
                      <TableCell align="right">{item.total_trades || 0}</TableCell>
                      <TableCell align="right">{item.avg_trade_pnl || 0}</TableCell>
                      <TableCell align="right">{item.total_pnl || 0}</TableCell>
                      <TableCell align="right">{item.exchanges_used || 0}</TableCell>
                      <TableCell align="right">{item.total_qty || 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ) : (
          <Box>
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Explicación de las Métricas
              </Typography>
              <ul>
                <li><strong>Volumen total:</strong> Suma de todas las cantidades operadas en el día.</li>
                <li><strong>Canales Activos:</strong> Número de canales que realizaron operaciones en el día.</li>
                <li><strong>Copy Trades:</strong> Número total de copytrades realizadas en el día.</li>
              </ul>
              <Typography variant="body2" color="text.secondary">
                Nota: Los datos se muestran para días completos (cerrados), excluyendo el día actual.
              </Typography>
            </Paper>

            <Box sx={{ mb: 3 }}>
              <Bar data={chartData} options={chartOptions} />
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Fecha</TableCell>
                    <TableCell align="right">Cantidad Total</TableCell>
                    <TableCell align="right">Canales Activos</TableCell>
                    <TableCell align="right">Total Trades</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{new Date(item.trade_date).toLocaleDateString()}</TableCell>
                      <TableCell align="right">{item.daily_total_qty || 0}</TableCell>
                      <TableCell align="right">{item.total_channels || 0}</TableCell>
                      <TableCell align="right">{item.total_trades || 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default Dashboard; 