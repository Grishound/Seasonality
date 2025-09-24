import { useEffect, useState } from 'react';
import { Typography, Paper, TextField, Autocomplete, FormControl, InputLabel, Select, MenuItem, Checkbox, ListItemText } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Papa from 'papaparse';
import styles from './styles.module.scss';

const Seasonality = () => {
  const [data, setData] = useState([]);
  const [exchanges, setExchanges] = useState([]);
  const [instruments, setInstruments] = useState([]);
  const [selectedExchange, setSelectedExchange] = useState('');
  const [selectedInstrument, setSelectedInstrument] = useState('');
  const [chartData, setChartData] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // TODO fetch data from backend API instead of static CSV 
        const response = await fetch('/dummy_historical_data.csv');
        const text = await response.text();
        Papa.parse(text, {
          header: true,
          dynamicTyping: true,
          complete: (results) => {
            const parsedData = results.data
              .filter(row => row.date && row.close && row.open && row.high && row.low)
              .map(row => ({
                ...row,
                date: new Date(row.date),
                close: Number(row.close),
                open: Number(row.open),
                high: Number(row.high),
                low: Number(row.low)
              }));
            setData(parsedData);
            const uniqueExchanges = [...new Set(parsedData.map(row => row.exchange))];
            setExchanges(uniqueExchanges);
          }
        });
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    
    loadData();
  }, []);

  useEffect(() => {
    if (selectedExchange) {
      const filteredInstruments = [...new Set(
        data
          .filter(row => row.exchange === selectedExchange)
          .map(row => row.instrument_name)
      )];
      setInstruments(filteredInstruments);
      setSelectedInstrument('');
    } else {
      setInstruments([]);
    }
  }, [selectedExchange, data]);

  useEffect(() => {
    console.log('Processing chart data:', { selectedExchange, selectedInstrument, dataLength: data.length });
    if (selectedInstrument && selectedExchange) {
      console.log('Data before filtering:', {
        totalRows: data.length,
        sampleRow: data[0],
        selectedExchange,
        selectedInstrument
      });
      const filteredData = data.filter(
        row => row.exchange === selectedExchange && row.instrument_name === selectedInstrument
      );
      const processedData = filteredData.reduce((acc, row) => {
        const date = new Date(row.date);
        const year = date.getFullYear();
        const normalizedDate = new Date(2000, date.getMonth(), date.getDate());
        const dateKey = normalizedDate.getTime();
        if (!acc[dateKey]) 
          acc[dateKey] = {
            date: normalizedDate,
          };
        acc[dateKey][year] = parseFloat(row.close);
        return acc;
      }, {});

      const chartData = Object.values(processedData)
        .sort((a, b) => a.date - b.date);
      
      // Get all available years from the data
      const years = Object.keys(chartData[0] || {})
        .filter(key => !isNaN(parseInt(key)) && key !== 'date')
        .sort((a, b) => parseInt(b) - parseInt(a)); // Sort years descending
      
      setAvailableYears(years);
      setChartData(chartData);
    } else {
      setChartData([]);
      setAvailableYears([]);
    }
  }, [selectedInstrument, selectedExchange, data]);

  // Separate useEffect for handling initial year selection
  useEffect(() => {
    if (availableYears.length > 0 && selectedYears.length === 0) {
      setSelectedYears(availableYears);
    }
  }, [availableYears, selectedYears.length]);

  const handleYearChange = (event) => {
    const {
      target: { value },
    } = event;
    setSelectedYears(typeof value === 'string' ? value.split(',') : value);
  };

  const getChartColor = (index) => {
    const colors = getComputedStyle(document.documentElement)
      .getPropertyValue('--chart-colors')
      .split(',')
      .map(color => color.trim());
    return colors[index % colors.length];
  };

  return (
    <div className={styles.seasonality}>
      <div className={styles.filterContainer}>
        <div className={styles.searchFilters}>
          <Autocomplete
            fullWidth
            options={exchanges}
            value={selectedExchange || null}
            onChange={(event, newValue) => {
              setSelectedExchange(newValue || '');
              setSelectedInstrument('');
            }}
            renderInput={(params) => (
              <TextField 
                {...params} 
                label="Search Exchange"
                placeholder="Type to search..."
              />
            )}
            filterOptions={(options, { inputValue }) => {
              return options.filter(option =>
                option?.toLowerCase().includes(inputValue.toLowerCase())
              );
            }}
          isOptionEqualToValue={(option, value) => option === value}
        />

        <Autocomplete
          fullWidth
          options={instruments}
          value={selectedInstrument || null}
          onChange={(event, newValue) => {
            setSelectedInstrument(newValue || '');
          }}
          disabled={!selectedExchange}
          renderInput={(params) => (
            <TextField 
              {...params} 
              label="Search Instrument"
              placeholder="Type to search..."
            />
          )}
          filterOptions={(options, { inputValue }) => {
            return options.filter(option =>
              option?.toLowerCase().includes(inputValue.toLowerCase())
            );
          }}
          isOptionEqualToValue={(option, value) => option === value}
        />
        </div>
        
        {availableYears.length > 0 && (
          <FormControl className={styles.yearSelect} fullWidth>
            <InputLabel id="year-select-label">Select Years</InputLabel>
            <Select
              labelId="year-select-label"
              multiple
              value={selectedYears}
              onChange={handleYearChange}
              renderValue={(selected) => selected.join(', ')}
              label="Select Years"
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 300
                  }
                }
              }}
              sx={{ height: 56 }}
            >
              {availableYears.map((year) => (
                <MenuItem key={year} value={year}>
                  <Checkbox checked={selectedYears.indexOf(year) > -1} />
                  <ListItemText primary={year} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </div>      <Paper className={styles.chartContainer}>
        <div className={styles.chartHeader}>
          <Typography variant="h6" className={styles.chartTitle}>
            Seasonal Pattern Analysis
          </Typography>
        </div>

        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="90%">
            <LineChart data={chartData}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="var(--chart-grid-color)" 
              />
              <XAxis 
                dataKey="date"
                tickFormatter={(value) => {
                  const date = new Date(value);
                  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                  return monthNames[date.getMonth()];
                }}
                interval={30}
                stroke="var(--text-color)"
                tick={{ fill: 'var(--text-color)' }}
              />
              <YAxis 
                stroke="var(--text-color)"
                tick={{ fill: 'var(--text-color)' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--tooltip-background)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-color)'
                }}
              />
              <Legend 
                wrapperStyle={{
                  color: 'var(--text-color)'
                }}
              />
              {selectedYears.map((year) => (
                <Line
                  key={year}
                  type="natural"
                  dataKey={year}
                  name={`Year ${year}`}
                  stroke={getChartColor(selectedYears.indexOf(year))}
                  dot={false}
                  strokeWidth={parseInt(getComputedStyle(document.documentElement).getPropertyValue('--line-stroke-width'))}
                  connectNulls={true}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className={styles.noData}>
            <Typography variant="h6" color="textSecondary">
              Select an exchange and instrument to view the chart
            </Typography>
          </div>
        )}
      </Paper>
    </div>
  );
};

export default Seasonality;