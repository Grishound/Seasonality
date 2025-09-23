import React from 'react';
import { Typography, Paper, Switch, FormControlLabel, TextField, Button } from '@mui/material';
import styles from './Settings.module.scss';

const Settings = () => {
  return (
    <div className={styles.settings}>
      <Typography variant="h4" className={styles.header}>
        Settings
      </Typography>

      <Paper className={styles.card}>
        <div className={styles.section}>
          <Typography variant="h6" gutterBottom>
            Notifications
          </Typography>
          <div className={styles.formGroup}>
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Email Notifications"
            />
          </div>
          <div className={styles.formGroup}>
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Push Notifications"
            />
          </div>
        </div>

        <div className={styles.section}>
          <Typography variant="h6" gutterBottom>
            Profile Settings
          </Typography>
          <div className={styles.formGroup}>
            <TextField
              fullWidth
              label="Display Name"
              defaultValue="John Doe"
              variant="outlined"
              margin="normal"
            />
          </div>
          <div className={styles.formGroup}>
            <TextField
              fullWidth
              label="Email"
              defaultValue="john.doe@example.com"
              variant="outlined"
              margin="normal"
            />
          </div>
          <Button variant="contained" color="primary">
            Save Changes
          </Button>
        </div>
      </Paper>
    </div>
  );
};

export default Settings;