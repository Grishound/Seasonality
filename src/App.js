import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppBar, Toolbar, IconButton, Typography, Select, MenuItem, FormControl } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { Brightness4, Brightness7, Palette } from '@mui/icons-material';
import styles from './App.module.scss';

import Drawer from './components/Drawer';
import Seasonality from './pages/Seasonality/Seasonality';

// Placeholder components for future modules
const Markets = () => <></>;
const Analysis = () => <></>;
const Settings = () => <></>;

const colorSchemes = [
  { value: 'standard', label: 'Standard Colors' },
  { value: 'deuteranopia', label: 'Deuteranopia' },
  { value: 'tritanopia', label: 'Tritanopia' }
];

function App() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [colorScheme, setColorScheme] = useState('standard');

  useEffect(() => {
    const savedMode = localStorage.getItem('app-mode') === 'dark';
    const savedScheme = localStorage.getItem('app-color-scheme') || 'standard';
    setIsDarkMode(savedMode);
    setColorScheme(savedScheme);
  }, []);

  useEffect(() => {
    const themeMode = isDarkMode ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', `${themeMode}-${colorScheme}`);
    localStorage.setItem('app-mode', themeMode);
    localStorage.setItem('app-color-scheme', colorScheme);
  }, [isDarkMode, colorScheme]);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleColorSchemeChange = (event) => {
    setColorScheme(event.target.value);
  };

  return (
    <Router>
      <div className={styles.app}>
        <AppBar position="static">
          <Toolbar className={styles.toolbar}>
            <IconButton
              edge="start"
              color="inherit"
              onClick={toggleDrawer}
              className={styles.menuButton}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" className={styles.title}>
              Trade View
            </Typography>
            <div className={styles.themeControls}>
              <FormControl size="small" variant="outlined">
                <Select
                  value={colorScheme}
                  onChange={handleColorSchemeChange}
                  className={styles.colorSchemeSelect}
                  startAdornment={
                    <IconButton size="small" edge="start">
                      <Palette />
                    </IconButton>
                  }
                >
                  {colorSchemes.map((scheme) => (
                    <MenuItem key={scheme.value} value={scheme.value}>
                      {scheme.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <IconButton color="inherit" onClick={toggleTheme}>
                {isDarkMode ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
            </div>
          </Toolbar>
        </AppBar>

        <Drawer open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

                <main className={styles.content}>
          <Routes>
            <Route path="/" element={<Seasonality />} />
            <Route path="/seasonality" element={<Seasonality />} />
            <Route path="/markets" element={<Markets />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
