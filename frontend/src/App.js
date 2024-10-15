// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MetricForm from './components/MetricForm';
import MetricsOverview from './components/MetricsOverview';
import MetricsGrid from './components/MetricsGrid'; // Import the MetricsGrid component
import MetricDetail from './components/MetricDetail';
import EditMetric from './components/EditMetric'; // Import the EditMetric component
import Dashboard from './components/Dashboard';
import Header from './components/Header'; // Import the Header component
import Footer from './components/Footer'; // Import the Footer component
import { Box } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

function App() {
  // Create a theme instance (you can customize it if needed)
  const theme = createTheme();

  return (
    <ThemeProvider theme={theme}>
      <Router>
        {/* Use Box to create a flex container */}
        <Box display="flex" flexDirection="column" minHeight="100vh">
          {/* Header */}
          <Header />

          {/* Main content */}
          <Box component="main" flexGrow={1}>
            <Routes>
              {/* Metrics Overview Page */}
              <Route path="/" element={<MetricsOverview />} />

              {/* All Metrics Page */}
              <Route path="/metrics/all" element={<MetricsGrid />} />

              {/* Metric Detail Page */}
              <Route path="/metrics/:metricId" element={<MetricDetail />} />

              {/* Add New Metric Page */}
              <Route path="/metrics/new" element={<MetricForm />} />

              {/* Edit Metric Page */}
              <Route path="/metrics/edit/:metricId" element={<EditMetric />} />

              {/* Dashboard Route with metricId parameter */}
              <Route path="/dashboard/:metricId" element={<Dashboard />} />
              {/* Optionally, keep the general dashboard route */}
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </Box>

          {/* Footer */}
          <Footer />
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
