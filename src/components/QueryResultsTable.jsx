import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from '@mui/material';

const QueryResultsTable = ({ data }) => {
  if (!data || data.length === 0) {
    return <Typography>No hay datos para mostrar</Typography>;
  }

  return (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table sx={{ minWidth: 650 }} aria-label="query results table">
        <TableHead>
          <TableRow>
            <TableCell>Owner ID</TableCell>
            <TableCell>Owner Name</TableCell>
            <TableCell>Canal</TableCell>
            <TableCell align="right">Signals</TableCell>
            <TableCell align="right">Trades</TableCell>
            <TableCell align="right">PNL Promedio</TableCell>
            <TableCell align="right">PNL Total</TableCell>
            <TableCell align="right">Exchanges</TableCell>
            <TableCell align="right">Total QTY</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow
              key={`${row.owner_id}-${row.channel_title}`}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {row.owner_id}
              </TableCell>
              <TableCell>{row.owner_name}</TableCell>
              <TableCell>{row.channel_title}</TableCell>
              <TableCell align="right">{row.total_signals}</TableCell>
              <TableCell align="right">{row.total_trades}</TableCell>
              <TableCell align="right">{row.avg_trade_pnl}</TableCell>
              <TableCell align="right">{row.total_pnl}</TableCell>
              <TableCell align="right">{row.exchanges_used}</TableCell>
              <TableCell align="right">{row.total_qty}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default QueryResultsTable; 