import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MantineProvider, createTheme } from '@mantine/core';
import '@mantine/core/styles.css';
import App from './SchoolsApp';
import './styles.css';
import './schools.css';

const theme = createTheme({
  primaryColor: 'epitech',
  colors: {
    epitech: ['#f0f2ff', '#dfe3ff', '#b9c2ff', '#8b9aff', '#6072ff', '#4358ff', '#283cf2', '#2031d4', '#1b2cb8', '#16249c'],
  },
  fontFamily: 'Inter, Arial, sans-serif',
  headings: { fontFamily: '"Barlow Condensed", Inter, sans-serif', fontWeight: '700' },
  defaultRadius: 0,
});

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found.');

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <MantineProvider theme={theme}>
      <BrowserRouter><App /></BrowserRouter>
    </MantineProvider>
  </React.StrictMode>,
);
