import { createRoot } from 'react-dom/client'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { curaTheme } from './theme/curaTheme'
import './index.scss'
import App from './App.jsx'

async function prepare() {
  if (import.meta.env.VITE_MOCK === 'true') {
    const { worker } = await import('./mocks/browser');
    return worker.start({ onUnhandledRequest: 'bypass' });
  }
}

prepare().then(() =>
  createRoot(document.getElementById('root')).render(
    <ThemeProvider theme={curaTheme}>
      <CssBaseline enableColorScheme />
      <App />
    </ThemeProvider>
  )
);
