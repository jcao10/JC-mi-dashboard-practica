import { DatePicker } from '@mui/x-date-pickers';
import { Box } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import esLocale from 'date-fns/locale/es';

const DateRangePicker = ({ onDateChange }) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={esLocale}>
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <DatePicker
          label="Fecha Inicio"
          onChange={(date) => onDateChange('start', date)}
          format="dd/MM/yyyy"
        />
        <DatePicker
          label="Fecha Fin"
          onChange={(date) => onDateChange('end', date)}
          format="dd/MM/yyyy"
        />
      </Box>
    </LocalizationProvider>
  );
};

export default DateRangePicker; 