import { createTheme } from '@mui/material/styles';

export const getMuiTheme = (mode: 'light' | 'dark') =>
  createTheme({
    palette: {
      mode,
      ...(mode === 'dark'
        ? {
            background: {
              default: '#18181b',
              paper: '#232329',
            },
          }
        : {
            background: {
              default: '#f3f4f6',
              paper: '#fff',
            },
          }),
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  });
