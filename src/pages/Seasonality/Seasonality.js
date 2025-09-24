import { useEffect, useState } from 'react';
import { Typography, Paper, TextField, Autocomplete } from '@mui/material';
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
      setChartData(chartData);
    } else 
      setChartData([]);
  }, [selectedInstrument, selectedExchange, data]);

  const years = chartData.length > 0
    ? Object.keys(chartData[0])
        .filter(key => !isNaN(parseInt(key)) && key !== 'date')
        .sort((a, b) => parseInt(a) - parseInt(b))
    : [];

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  return (
    <div className={styles.seasonality}>
      <div className={styles.filterContainer}>
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

      <Paper className={styles.chartContainer}>
        <div className={styles.chartHeader}>
          <Typography variant="h6" className={styles.chartTitle}>
            Seasonal Pattern Analysis
          </Typography>
        </div>

        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="90%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date"
                tickFormatter={(value) => {
                  const date = new Date(value);
                  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                  return monthNames[date.getMonth()];
                }}
                interval={30} 
              />
              <YAxis />
              <Tooltip />
              <Legend />
              {years.map((year) => (
                <Line
                  key={year}
                  type="natural"
                  dataKey={year}
                  name={`Year ${year}`}
                  stroke={getRandomColor()}
                  dot={false}
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