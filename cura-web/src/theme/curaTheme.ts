import { createTheme } from '@mui/material/styles';

export const curaTheme = createTheme({
  palette: {
    background: { default: '#F0F2F5', paper: '#FFFFFF' },
    primary: { main: '#1E3A5F' },
    secondary: { main: '#4A90D9' },
    text: { primary: '#1E3A5F', secondary: '#7A8FA6' },
    divider: '#DDE3EC',
    error: { main: '#E05050' },
    warning: { main: '#E8A032' },
    success: { main: '#3AB06A' },
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
    h1: { fontFamily: '"Fraunces", Georgia, serif' },
    h2: { fontFamily: '"Fraunces", Georgia, serif' },
    h3: { fontFamily: '"Fraunces", Georgia, serif' },
    h4: { fontFamily: '"Fraunces", Georgia, serif' },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          border: '0.5px solid #DDE3EC',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, boxShadow: 'none', '&:hover': { boxShadow: 'none' } },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, fontSize: 10 },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, fontSize: 13 },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: { fontWeight: 600, fontSize: 12, color: '#7A8FA6', background: '#F8F9FB' },
        body: { fontSize: 13 },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': { borderColor: '#DDE3EC' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { boxShadow: 'none', border: '0.5px solid #DDE3EC' },
      },
    },
  },
});
