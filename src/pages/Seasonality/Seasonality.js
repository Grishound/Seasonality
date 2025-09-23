import React, { useEffect, useState } from 'react';
import { Typography, Paper, ToggleButton, ToggleButtonGroup, TextField, Autocomplete } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Scatter } from 'recharts';
import TimelineIcon from '@mui/icons-material/Timeline';
import CandlestickChartIcon from '@mui/icons-material/CandlestickChart';
import Papa from 'papaparse';
import styles from './styles.module.scss';

const Seasonality = () => {
  const [data, setData] = useState([]);
  const [exchanges, setExchanges] = useState([]);
  const [instruments, setInstruments] = useState([]);
  const [selectedExchange, setSelectedExchange] = useState('');
  const [selectedInstrument, setSelectedInstrument] = useState('');
  const [chartData, setChartData] = useState([]);
  const [chartType, setChartType] = useState('line');

  // Load and parse CSV data
  useEffect(() => {
    const loadData = async () => {
      try {
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
            
            // Get unique exchanges
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

  // Update instruments when exchange is selected
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

  // Process data for chart when instrument is selected
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
      console.log('Filtered data:', filteredData);

      // Process data by year
      const processedData = filteredData.reduce((acc, row) => {
        const date = new Date(row.date);
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();
        
        // Create date string without year for x-axis
        const dateKey = `${month + 1}-${day}`;
        
        if (!acc[dateKey]) {
          acc[dateKey] = { date: dateKey };
        }
        
        // For line chart data
        acc[dateKey][year] = parseFloat(row.close);
        
        // For candlestick data
        acc[dateKey][`${year}_open`] = parseFloat(row.open);
        acc[dateKey][`${year}_high`] = parseFloat(row.high);
        acc[dateKey][`${year}_low`] = parseFloat(row.low);
        acc[dateKey][`${year}_close`] = parseFloat(row.close);
        return acc;
      }, {});

      // Convert to array and sort by date
      const chartData = Object.values(processedData)
        .sort((a, b) => {
          const [aMonth, aDay] = a.date.split('-').map(Number);
          const [bMonth, bDay] = b.date.split('-').map(Number);
          return aMonth === bMonth ? aDay - bDay : aMonth - bMonth;
        });

      console.log('Processed chart data:', {
        chartType,
        dataPoints: chartData.length,
        sampleData: chartData[0],
        years: Object.keys(chartData[0] || {}).filter(key => !key.includes('date'))
      });
      setChartData(chartData);
    } else {
      setChartData([]);
    }
  }, [selectedInstrument, selectedExchange, data, chartType]);

  // Get unique years for chart lines
  const years = chartData.length > 0
    ? Object.keys(chartData[0]).filter(key => {
        if (chartType === 'line') {
          // For line chart, only include numeric years
          return !isNaN(parseInt(key)) && !key.includes('_');
        }
        // For candlestick, only include keys ending with _open to get unique years
        return key.endsWith('_open');
      }).map(key => key.replace('_open', ''))
    : [];

  // Generate random colors for lines
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
      <Typography variant="h4" className={styles.header}>
        Seasonality Analysis
      </Typography>

      <div className={styles.filterContainer}>
        <Autocomplete
          fullWidth
          options={exchanges}
          value={selectedExchange || null}
          onChange={(event, newValue) => {
            setSelectedExchange(newValue || '');
            // Reset instrument when exchange changes
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
          <ToggleButtonGroup
            value={chartType}
            exclusive
            onChange={(e, newType) => newType && setChartType(newType)}
            size="small"
          >
            <ToggleButton value="line" aria-label="line chart">
              <TimelineIcon />
            </ToggleButton>
            <ToggleButton value="candlestick" aria-label="candlestick chart">
              <CandlestickChartIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        </div>

        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="90%">
            {chartType === 'line' ? (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date"
                  tickFormatter={(value) => {
                    const [month, day] = value.split('-');
                    return `${month}/${day}`;
                  }}
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
            ) : (
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date"
                  tickFormatter={(value) => {
                    const [month, day] = value.split('-');
                    return `${month}/${day}`;
                  }}
                />
                <YAxis />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const yearData = payload[0].payload;
                      return (
                        <div className={styles.tooltip}>
                          <p>Date: {yearData.date}</p>
                          {years.map(year => (
                            <div key={year} style={{ color: getRandomColor() }}>
                              <p>Year {year}:</p>
                              <p>Open: {yearData[`${year}_open`]}</p>
                              <p>High: {yearData[`${year}_high`]}</p>
                              <p>Low: {yearData[`${year}_low`]}</p>
                              <p>Close: {yearData[`${year}_close`]}</p>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                {years.map((year) => {
                  const color = getRandomColor();
                  return (
                    <Scatter
                      key={year}
                      name={`Year ${year}`}
                      data={chartData}
                      fill={color}
                      shape={(props) => {
                        const { cx, cy, payload } = props;
                        const open = payload[`${year}_open`];
                        const close = payload[`${year}_close`];
                        const high = payload[`${year}_high`];
                        const low = payload[`${year}_low`];
                        
                        if (!open || !close || !high || !low) return null;
                        
                        const candleWidth = 8;
                        const isUp = close > open;
                        
                        return (
                          <g>
                            <line 
                              x1={cx} 
                              y1={props.yScale(high)} 
                              x2={cx} 
                              y2={props.yScale(low)} 
                              stroke={color} 
                            />
                            <rect
                              x={cx - candleWidth / 2}
                              y={props.yScale(Math.max(open, close))}
                              width={candleWidth}
                              height={Math.abs(props.yScale(open) - props.yScale(close))}
                              fill={isUp ? "white" : color}
                              stroke={color}
                            />
                          </g>
                        );
                      }}
                    />
                  );
                })}
              </ComposedChart>
            )}
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