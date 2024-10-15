// src/components/MetricsOverview.js
import React, { useEffect, useState, useMemo } from 'react';
import {
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  CircularProgress,
  Snackbar, // Imported for notifications
  Alert,    // Imported for notifications
  Tooltip,  // Imported for tooltips
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WarningIcon from '@mui/icons-material/Warning'; // Imported for warning indicators
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format, addWeeks, startOfWeek } from 'date-fns';

const MetricsOverview = () => {
  const [metrics, setMetrics] = useState([]);
  const [metricData, setMetricData] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [countries, setCountries] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [weeks, setWeeks] = useState([]);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [expandedMetricId, setExpandedMetricId] = useState(null);

  const [snackbar, setSnackbar] = useState({ // Snackbar state for notifications
    open: false,
    message: '',
    severity: 'error',
  });

  const [lastWeekMissingMetrics, setLastWeekMissingMetrics] = useState([]); // State to track metrics missing last week's data

  const navigate = useNavigate();

  // Calculate the last 8 weeks (7 weeks ago + current week)
  useEffect(() => {
    const currentWeekStart = startOfWeek(new Date());
    const weeksArray = [];
    for (let i = -7; i <= 0; i++) {
      const weekStart = addWeeks(currentWeekStart, i);
      weeksArray.push(format(weekStart, 'yyyy-MM-dd'));
    }
    setWeeks(weeksArray);
  }, []);

  // Fetch metrics and necessary data
  useEffect(() => {
    const fetchMetrics = async () => {
      setLoadingMetrics(true);
      try {
        // Fetch metrics
        const metricsResponse = await axios.get('http://localhost:5000/api/metrics');
        const allMetrics = metricsResponse.data;
        setMetrics(allMetrics);

        // Extract unique countries and teams
        const uniqueCountries = [...new Set(allMetrics.map((metric) => metric.country))].filter(Boolean);
        setCountries(uniqueCountries);

        const uniqueTeams = [...new Set(allMetrics.map((metric) => metric.team))].filter(Boolean);
        setTeams(uniqueTeams);
      } catch (error) {
        console.error('Error fetching metrics:', error);
        setSnackbar({
          open: true,
          message: 'Failed to fetch metrics.',
          severity: 'error',
        });
      } finally {
        setLoadingMetrics(false);
      }
    };

    fetchMetrics();
  }, []);

  // Fetch last week's data for all metrics to identify missing data
  useEffect(() => {
    if (metrics.length > 0 && weeks.length > 0) {
      // Define "last week" as the week before the current week
      const lastWeek = weeks[weeks.length - 2]; // Changed from weeks.length -1 to weeks.length -2
      const metricIds = metrics.map((m) => m.id).join(',');

      axios
        .get('http://localhost:5000/api/metric-values', {
          params: { metric_ids: metricIds, weeks: lastWeek },
        })
        .then((response) => {
          const valuesData = response.data;

          // Identify metrics missing last week's data
          const missingMetrics = metrics
            .filter((metric) => !valuesData.some((d) => d.metric_id === metric.id && d.week_start === lastWeek))
            .map((m) => m.id);

          setLastWeekMissingMetrics(missingMetrics);
        })
        .catch((error) => {
          console.error('Error fetching last week data:', error);
          setSnackbar({
            open: true,
            message: 'Failed to fetch last week data.',
            severity: 'error',
          });
        });
    }
  }, [metrics, weeks]);

  // Filtered metrics based on search query and selected filters
  const filteredMetrics = useMemo(() => {
    return metrics.filter((metric) => {
      const matchesSearch = metric.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCountry = selectedCountry ? metric.country === selectedCountry : true;
      const matchesTeam = selectedTeam ? metric.team === selectedTeam : true;
      return matchesSearch && matchesCountry && matchesTeam;
    });
  }, [metrics, searchQuery, selectedCountry, selectedTeam]);

  // Fetch metric data when a metric is expanded
  const handleAccordionChange = (metricId) => async (event, isExpanded) => {
    setExpandedMetricId(isExpanded ? metricId : null);

    if (isExpanded && !metricData[metricId]) {
      try {
        setMetricData((prev) => ({ ...prev, [metricId]: { loading: true } }));

        const weeksParam = weeks.join(',');

        // Fetch values and goals for the metric
        const [valuesResponse, goalsResponse] = await Promise.all([
          axios.get(`http://localhost:5000/api/metric-values`, {
            params: { metric_ids: metricId, weeks: weeksParam },
          }),
          axios.get(`http://localhost:5000/api/goals`, {
            params: { metric_ids: metricId, weeks: weeksParam },
          }),
        ]);

        const valuesData = valuesResponse.data;
        const goalsData = goalsResponse.data;

        const valuesArray = weeks.map((week) => {
          const dataForWeek = valuesData.find((d) => d.week_start === week);
          return dataForWeek ? dataForWeek.value : '';
        });

        const goalsArray = weeks.map((week) => {
          const dataForWeek = goalsData.find((g) => g.week_start === week);
          return dataForWeek ? dataForWeek.target_value : ''; // Corrected line
        });

        setMetricData((prev) => ({
          ...prev,
          [metricId]: {
            values: valuesArray,
            goals: goalsArray,
            loading: false,
          },
        }));
      } catch (error) {
        console.error('Error fetching metric data:', error);
        setMetricData((prev) => ({ ...prev, [metricId]: { error: true, loading: false } }));
        setSnackbar({
          open: true,
          message: 'Failed to fetch metric data.',
          severity: 'error',
        });
      }
    }
  };

  const handleMetricClick = (metricId) => {
    // Navigate to the Metric Detail Page
    navigate(`/metrics/${metricId}`);
  };

  const handleEditMetric = (metricId) => {
    // Navigate to the Edit Metric Page
    navigate(`/metrics/edit/${metricId}`);
  };

  // Function to handle Dashboard button click
  const handleDashboardClick = (metricId) => {
    // Open Dashboard in a new tab with metricId as route parameter
    const dashboardUrl = `/dashboard/${metricId}`;
    window.open(dashboardUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h4" gutterBottom>
        All Metrics
      </Typography>

      {/* Search Bar */}
      <TextField
        label="Search Metrics"
        variant="outlined"
        fullWidth
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ marginBottom: '20px' }}
      />

      {/* Filters */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        {/* Country Filter */}
        <FormControl variant="outlined" style={{ flex: 1 }}>
          <InputLabel id="country-select-label">Country</InputLabel>
          <Select
            labelId="country-select-label"
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            label="Country"
          >
            <MenuItem value="">
              <em>All Countries</em>
            </MenuItem>
            {countries.map((country) => (
              <MenuItem key={country} value={country}>
                {country}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Team Filter */}
        <FormControl variant="outlined" style={{ flex: 1 }}>
          <InputLabel id="team-select-label">Team</InputLabel>
          <Select
            labelId="team-select-label"
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            label="Team"
          >
            <MenuItem value="">
              <em>All Teams</em>
            </MenuItem>
            {teams.map((team) => (
              <MenuItem key={team} value={team}>
                {team}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      {/* Loading Indicator */}
      {loadingMetrics ? (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <CircularProgress />
        </div>
      ) : filteredMetrics.length > 0 ? (
        filteredMetrics.map((metric) => (
          <Accordion
            key={metric.id}
            expanded={expandedMetricId === metric.id}
            onChange={handleAccordionChange(metric.id)}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <div style={{ flexGrow: 1 }}>
                <Typography
                  variant="h6"
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  {metric.name}
                  {lastWeekMissingMetrics.includes(metric.id) && (
                    <Tooltip title="Last week's metric is missing">
                      <WarningIcon color="error" fontSize="small" style={{ marginLeft: '8px' }} />
                    </Tooltip>
                  )}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {metric.description}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {metric.team && (
                    <span>
                      <strong>Team:</strong> {metric.team}{' '}
                    </span>
                  )}
                  {metric.country && (
                    <span>
                      <strong>Country:</strong> {metric.country}
                    </span>
                  )}
                </Typography>
              </div>
              {/* Edit Metric Button */}
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => handleEditMetric(metric.id)}
                style={{ marginRight: '10px' }}
                aria-label={`Edit ${metric.name}`}
              >
                Edit
              </Button>
              {/* Add Data Button */}
              <Button
                variant="contained"
                onClick={() => handleMetricClick(metric.id)}
                sx={{
                  backgroundColor: '#386743',
                  color: '#FFFFFF',
                  '&:hover': {
                    backgroundColor: '#2e5633',
                  },
                  marginRight: '10px',
                }}
                aria-label={`Add data to ${metric.name}`}
              >
                Add Data
              </Button>
              {/* Dashboard Button */}
              <Button
                variant="contained"
                onClick={() => handleDashboardClick(metric.id)}
                sx={{
                  backgroundColor: '#592846',
                  color: '#FFFFFF',
                  '&:hover': {
                    backgroundColor: '#46233a',
                  },
                }}
                aria-label={`Go to dashboard for ${metric.name}`}
              >
                Dashboard
              </Button>
            </AccordionSummary>
            <AccordionDetails>
              {metricData[metric.id]?.loading ? (
                <div style={{ textAlign: 'center', width: '100%' }}>
                  <CircularProgress />
                </div>
              ) : metricData[metric.id]?.error ? (
                <Typography variant="body2" color="error">
                  Failed to load data.
                </Typography>
              ) : (
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell>Week</TableCell>
                        {weeks.map((week, index) => (
                          <TableCell key={index}>{format(new Date(week), 'MMM dd')}</TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell>Value</TableCell>
                        {metricData[metric.id]?.values.map((value, index) => (
                          <TableCell key={index}>{value !== '' ? value : '-'}</TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell>Goal</TableCell>
                        {metricData[metric.id]?.goals.map((goal, index) => (
                          <TableCell key={index}>{goal !== '' ? goal : '-'}</TableCell>
                        ))}
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </AccordionDetails>
          </Accordion>
        ))
      ) : (
        <Typography variant="body1">No metrics found.</Typography>
      )}

      {/* Action Buttons */}
      <div style={{ marginTop: '20px' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/metrics/new')}
          style={{ marginRight: '10px' }}
          aria-label="Add New Metric"
        >
          Add New Metric
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => window.open('/dashboard', '_blank', 'noopener,noreferrer')}
          aria-label="Go to Dashboard"
        >
          Go to Dashboard
        </Button>
      </div>

      {/* Notification Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default MetricsOverview;
