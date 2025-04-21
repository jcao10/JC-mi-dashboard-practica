import React, { useState, useEffect } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { 
  Container, 
  Box, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material';
import DateRangePicker from './DateRangePicker';

ChartJS.register(
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [viewType, setViewType] = useState('byChannel');
  const [data, setData] = useState([]);
  const [volumeByExchange, setVolumeByExchange] = useState([]);
  const [dateRange, setDateRange] = useState({
    start: new Date('2025-04-01'),
    end: new Date()
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleTabChange = (event, newValue) => {
    setViewType(newValue);
  };

  const handleDateChange = (type, date) => {
    setDateRange(prev => ({
      ...prev,
      [type]: date
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Formatear fechas para la API
        const formatDate = (date) => date.toISOString().split('T')[0];
        const startDate = formatDate(dateRange.start);
        const endDate = formatDate(dateRange.end);

        // Fetch data por canal
        const channelResponse = await fetch(`http://localhost:3002/api/query-by-channel?startDate=${startDate}&endDate=${endDate}`);
        const channelData = await channelResponse.json();
        setData(channelData);

        // Fetch data por exchange
        const exchangeResponse = await fetch(`http://localhost:3002/api/query-volume-by-exchange?startDate=${startDate}&endDate=${endDate}`);
        const exchangeData = await exchangeResponse.json();
        setVolumeByExchange(exchangeData);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [viewType, dateRange]);

  if (loading) return <div>Cargando datos...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data || data.length === 0) return <div>No hay datos disponibles</div>;

  // Preparar datos para el gráfico
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('es-ES', { month: 'long' });
    return `${day} ${month}`;
  };

  // Agrupar volúmenes por fecha y calcular totales
  const groupedVolumeData = volumeByExchange.reduce((acc, item) => {
    const date = new Date(item.trade_date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short'
    });
    
    if (!acc[date]) {
      acc[date] = {
        date,
        exchanges: {},
        totalVolume: 0
      };
    }
    
    acc[date].exchanges[item.exchange] = parseFloat(item.daily_volume);
    acc[date].totalVolume += parseFloat(item.daily_volume);
    
    return acc;
  }, {});

  // Obtener todos los exchanges únicos
  const allExchanges = [...new Set(volumeByExchange.map(item => item.exchange))].sort();

  // Convertir a array y ordenar por fecha (más reciente primero)
  const sortedData = Object.values(groupedVolumeData)
    .sort((a, b) => {
      // Convertir fechas al formato YYYY-MM-DD para ordenamiento correcto
      const dateA = new Date(a.date.split(' ').reverse().join(' '));
      const dateB = new Date(b.date.split(' ').reverse().join(' '));
      return dateB - dateA; // Orden descendente (más reciente primero)
    });

  // Calcular el volumen acumulado
  const dataWithAccumulated = sortedData.map((group, index, array) => {
    // Calculamos el acumulado sumando todos los días desde el más antiguo hasta el actual
    const accumulatedVolume = array
      .slice(index) // Tomamos desde el día actual hasta el final (días más antiguos)
      .reduce((sum, day) => sum + day.totalVolume, 0);
    
    return {
      ...group,
      accumulatedVolume
    };
  });

  // No necesitamos invertir el orden ya que ya está ordenado de más reciente a más antiguo
  const finalData = dataWithAccumulated;

  // Calcular totales por columna
  const columnTotals = finalData.reduce((totals, group) => {
    allExchanges.forEach(exchange => {
      totals[exchange] = (totals[exchange] || 0) + (group.exchanges[exchange] || 0);
    });
    totals.totalVolume = (totals.totalVolume || 0) + group.totalVolume;
    return totals;
  }, {});

  // Preparar datos para el gráfico
  const chartData = {
    labels: data.map(item => formatDate(item.trade_date)),
    datasets: [
      {
        label: 'Volumen Acumulado',
        data: dataWithAccumulated.map(item => item.accumulatedVolume),
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        type: 'line',
        tension: 0.4,
        fill: true
      }
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
        text: 'Volumen Acumulado',
      },
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          autoSkip: true,
          maxTicksLimit: 15
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Volumen Acumulado'
        }
      }
    }
  };

  // Preparar datos para el gráfico de líneas por exchange
  const prepareExchangeData = () => {
    // Agrupar exchanges
    const exchangeGroups = {
      'binance': ['binance', 'binance_spot', 'binance_cm'],
      'bybit': ['bybit', 'bybit_spot'],
      'okx': ['okx', 'okx_spot', 'okx_cm'],
      'bitget': ['bitget'],
      'bingx': ['bingx'],
      'trubit': ['trubit']
    };

    const dates = [...new Set(volumeByExchange.map(item => item.trade_date))].sort();
    
    const datasets = Object.entries(exchangeGroups).map(([groupName, exchanges], index) => {
      const groupData = dates.map(date => {
        const dailyTotal = volumeByExchange
          .filter(item => 
            exchanges.includes(item.exchange) && 
            item.trade_date === date
          )
          .reduce((sum, item) => sum + parseFloat(item.daily_volume), 0);
        return dailyTotal;
      });

      // Asignar colores según el índice
      const hue = (index * 137.5) % 360;
      const saturation = 70;
      const lightness = 50;

      return {
        label: groupName.toUpperCase(),
        data: groupData,
        borderColor: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
        backgroundColor: `hsla(${hue}, ${saturation}%, ${lightness}%, 0.1)`,
        tension: 0.4,
        fill: false
      };
    });

    // Agregar el volumen acumulado como una nueva serie
    const accumulatedVolumeData = dates.map((date, index) => {
      // Sumamos todos los volúmenes hasta la fecha actual
      const totalVolume = volumeByExchange
        .filter(item => {
          const itemDate = new Date(item.trade_date);
          const currentDate = new Date(date);
          return itemDate <= currentDate;
        })
        .reduce((sum, item) => sum + parseFloat(item.daily_volume), 0);
      return totalVolume;
    });

    datasets.push({
      label: 'Volumen Acumulado',
      data: accumulatedVolumeData,
      borderColor: 'rgba(54, 162, 235, 1)',
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      type: 'line',
      tension: 0.4,
      fill: true
    });

    return {
      labels: dates.map(date => formatDate(date)),
      datasets,
      options: {
        responsive: true,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Volumen Diario por Exchange y Volumen Acumulado',
          },
        },
        scales: {
          x: {
            ticks: {
              maxRotation: 45,
              minRotation: 45,
              autoSkip: true,
              maxTicksLimit: 15
            }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Volumen'
            },
            beginAtZero: true,
            ticks: {
              callback: value => {
                if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
                return value;
              }
            }
          }
        }
      }
    };
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ width: '100%', mt: 4 }}>
        <DateRangePicker onDateChange={handleDateChange} />
        <Tabs
          value={viewType}
          onChange={handleTabChange}
          centered
          sx={{ mb: 4 }}
        >
          <Tab value="byChannel" label="Vista por Canal" />
          <Tab value="byDay" label="Vista por Día" />
        </Tabs>

        {viewType === 'byDay' ? (
          <>
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Métricas por Día
              </Typography>
              <ul>
                <li><strong>Cantidad Total:</strong> Volumen total operado en el día.</li>
                <li><strong>Canales Activos:</strong> Número de canales que operaron en el día.</li>
                <li><strong>Total Trades:</strong> Número total de operaciones realizadas en el día.</li>
              </ul>
              <Typography variant="body2" color="text.secondary">
                Nota: Los datos se muestran de los últimos 30 días.
              </Typography>
            </Paper>

            <Paper sx={{ p: 2, mb: 4 }}>
              <Bar data={chartData} options={chartOptions} />
            </Paper>

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
                  {data.map((row) => (
                    <TableRow key={row.trade_date}>
                      <TableCell>{formatDate(row.trade_date)}</TableCell>
                      <TableCell align="right">{row.daily_total_qty || '0'}</TableCell>
                      <TableCell align="right">{row.total_channels || '0'}</TableCell>
                      <TableCell align="right">{row.total_trades || '0'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        ) : (
          <>
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Métricas por Canal
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

            <TableContainer component={Paper} sx={{ mb: 4 }}>
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
                  {data.map((item) => (
                    <TableRow key={item.channel_title}>
                      <TableCell>{item.channel_title}</TableCell>
                      <TableCell align="right">{item.total_signals}</TableCell>
                      <TableCell align="right">{item.total_trades}</TableCell>
                      <TableCell align="right">{item.avg_trade_pnl}</TableCell>
                      <TableCell align="right">{item.total_pnl}</TableCell>
                      <TableCell align="right">{item.exchanges_used}</TableCell>
                      <TableCell align="right">{item.total_qty}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Volumen Diario por Exchange
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Nota: Los datos muestran el volumen operado en cada exchange durante los últimos 30 días.
              </Typography>
              <Box sx={{ height: 400 }}>
                <Line data={prepareExchangeData()} options={prepareExchangeData().options} />
              </Box>
            </Paper>

            <Typography variant="h5" gutterBottom>
              Volumen Diario por Exchange
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Muestra el volumen diario por exchange, ordenado por fecha (más reciente primero).
            </Typography>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Fecha</TableCell>
                    {allExchanges.map(exchange => (
                      <TableCell key={exchange} align="right">{exchange}</TableCell>
                    ))}
                    <TableCell align="right"><strong>Total Volume</strong></TableCell>
                    <TableCell align="right"><strong>Volumen Acumulado</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {finalData.map((group) => (
                    <TableRow key={group.date}>
                      <TableCell><strong>{group.date}</strong></TableCell>
                      {allExchanges.map(exchange => (
                        <TableCell key={`${group.date}-${exchange}`} align="right">
                          {group.exchanges[exchange]?.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0,00'}
                        </TableCell>
                      ))}
                      <TableCell align="right">
                        <strong>{group.totalVolume.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>{group.accumulatedVolume.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* Fila de totales */}
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell><strong>Total</strong></TableCell>
                    {allExchanges.map(exchange => (
                      <TableCell key={`total-${exchange}`} align="right">
                        <strong>{columnTotals[exchange]?.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0,00'}</strong>
                      </TableCell>
                    ))}
                    <TableCell align="right">
                      <strong>{columnTotals.totalVolume?.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0,00'}</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>{columnTotals.totalVolume?.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0,00'}</strong>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Box>
    </Container>
  );
};

export default Dashboard;