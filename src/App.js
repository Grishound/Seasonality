import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppBar, Toolbar, IconButton, Typography } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import styles from './App.module.scss';

// Components
import Drawer from './components/Drawer';

// Pages
import Dashboard from './pages/Dashboard/Dashboard';
import Seasonality from './pages/Seasonality/Seasonality';
import Settings from './pages/Settings/Settings';

function App() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
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
              React App
            </Typography>
          </Toolbar>
        </AppBar>

        <Drawer open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

        <main className={styles.content}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/seasonality" element={<Seasonality />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
