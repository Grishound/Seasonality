import React, { useEffect, useState } from 'react';
import { Typography, Paper, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import styles from './Settings.module.scss';

const themes = [
  { value: 'default', label: 'Default Theme', description: 'Standard color scheme' },
  { value: 'deuteranopia', label: 'Deuteranopia', description: 'Optimized for red-green color blindness' },
  { value: 'tritanopia', label: 'Tritanopia', description: 'Optimized for blue-yellow color blindness' },
  { value: 'high-contrast', label: 'High Contrast', description: 'Maximum contrast for better visibility' }
];

const Settings = () => {
  const [selectedTheme, setSelectedTheme] = useState('default');

  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme');
    if (savedTheme) {
      setSelectedTheme(savedTheme);
    }
  }, []);

  const handleThemeChange = (event) => {
    const newTheme = event.target.value;
    setSelectedTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('app-theme', newTheme);
  };

  return (
    <div className={styles.settings}>
      <Typography variant="h4" className={styles.header}>
        Display Settings
      </Typography>

      <Paper className={styles.card}>
        <div className={styles.section}>
          <Typography variant="h6" gutterBottom>
            Color Theme
          </Typography>
          <div className={styles.formGroup}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Select Theme</InputLabel>
              <Select
                value={selectedTheme}
                onChange={handleThemeChange}
                label="Select Theme"
              >
                {themes.map((theme) => (
                  <MenuItem key={theme.value} value={theme.value}>
                    <div className={styles.themeOption}>
                      <Typography variant="subtitle1">{theme.label}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {theme.description}
                      </Typography>
                    </div>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </div>
      </Paper>
    </div>
  );
};

export default Settings;