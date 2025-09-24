import React from 'react';
import { Drawer as MuiDrawer, List, ListItem, ListItemIcon, ListItemText, IconButton, Typography } from '@mui/material';
import { Menu as MenuIcon, Analytics } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Drawer.module.scss';

// Other menu items will be added later
const menuItems = [
  { text: 'Seasonality', icon: <Analytics/>, path: '/' }
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
        <Typography variant="h6">Menu</Typography>
        <IconButton onClick={onClose} color="inherit">
          <MenuIcon />
        </IconButton>
      </div>
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => handleNavigate(item.path)}
            className={`${styles.menuItem} ${location.pathname === item.path ? styles.active : ''}`}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>
            <ListItemText 
              primary={item.text}
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