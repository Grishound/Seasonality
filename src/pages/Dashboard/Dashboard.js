import React from 'react';
import { Typography, Paper, Grid } from '@mui/material';
import styles from './Dashboard.module.scss';

const DashboardCard = ({ title, content }) => (
  <Paper className={styles.card} elevation={2}>
    <Typography variant="h6" className={styles.cardTitle}>{title}</Typography>
    <Typography>{content}</Typography>
  </Paper>
);

const Dashboard = () => {
  const dashboardItems = [
    { title: 'Summary', content: 'Overview of your dashboard data' },
    { title: 'Recent Activity', content: 'Latest updates and changes' },
    { title: 'Statistics', content: 'Key metrics and numbers' },
    { title: 'Notifications', content: 'Important alerts and messages' }
  ];

  return (
    <div className={styles.dashboard}>
      <Typography variant="h4" className={styles.header}>
        Dashboard
      </Typography>
      <div className={styles.grid}>
        {dashboardItems.map((item, index) => (
          <DashboardCard key={index} {...item} />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;