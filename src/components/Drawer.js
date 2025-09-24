import React from 'react';
import { Drawer as MuiDrawer, List, ListItem, ListItemIcon, ListItemText, IconButton, Typography } from '@mui/material';
import { 
  Menu as MenuIcon, 
  Analytics, 
  TrendingUp, 
  ShowChart,
  Settings as SettingsIcon 
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Drawer.module.scss';

const menuItems = [
  { text: 'Seasonality', icon: <Analytics/>, path: '/seasonality' },
  { text: 'Markets', icon: <TrendingUp/>, path: '/markets' },
  { text: 'Analysis', icon: <ShowChart/>, path: '/analysis' },
  { text: 'Settings', icon: <SettingsIcon/>, path: '/settings' }
];

const Drawer = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <MuiDrawer
      className={styles.drawer}
      variant="temporary"
      anchor="left"
      open={open}
      onClose={onClose}
      classes={{
        paper: styles.drawerPaper
      }}
    >
      <div className={styles.drawerHeader}>
        <div className={styles.drawerTitle}>
          <Typography variant="h6">Trade View</Typography>
          <Typography variant="subtitle2" style={{ opacity: 0.8 }}>Analytics Platform</Typography>
        </div>
        <IconButton onClick={onClose} color="inherit" size="small">
          <MenuIcon />
        </IconButton>
      </div>
      <List sx={{ padding: '16px 8px' }}>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => handleNavigate(item.path)}
            className={`${styles.menuItem} ${location.pathname === item.path ? styles.active : ''}`}
          >
            <ListItemIcon className={styles.icon}>{item.icon}</ListItemIcon>
            <ListItemText 
              primary={item.text}
              className={styles.text}
              sx={{ 
                '& .MuiListItemText-primary': { 
                  color: 'inherit'
                }
              }} 
            />
          </ListItem>
        ))}
      </List>
    </MuiDrawer>
  );
};

export default Drawer;