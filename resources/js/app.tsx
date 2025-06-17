import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme, useAppearance } from './hooks/use-appearance';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { getMuiTheme } from './theme';

const appName = import.meta.env.VITE_APP_NAME || 'Shorty';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        function ThemedApp() {
            const { appearance } = useAppearance();
            const mode = appearance === 'dark' || (appearance === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
            const theme = getMuiTheme(mode);
            return (
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <App {...props} />
                </ThemeProvider>
            );
        }
        const root = createRoot(el);
        root.render(<ThemedApp />);
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
