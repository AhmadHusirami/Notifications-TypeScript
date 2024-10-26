import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, TextField, Button, AppBar, Toolbar, Typography, IconButton, ThemeProvider, createTheme } from '@mui/material';
import Nightlight from '@mui/icons-material/Nightlight'; // Moon icon
import WbSunny from '@mui/icons-material/WbSunny'; // Sun icon

const App: React.FC = () => {
  const [username, setUsername] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  // Toggle between light and dark modes
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Create Material-UI theme based on the dark mode state
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      background: {
        default: darkMode ? '#000000' : '#ffffff', // Black background in dark mode
        paper: darkMode ? '#000000' : '#ffffff', // Keep paper background the same as default
      },
      text: {
        primary: darkMode ? '#ffffff' : '#000000', // White text in dark mode and black text in light mode
      },
    },
  });

  useEffect(() => {
    // Register the service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
          subscribeUserToPush(registration);
        })
        .catch((error) => console.log('Service Worker registration failed:', error));
    }
  }, []);

  const subscribeUserToPush = async (registration: ServiceWorkerRegistration) => {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.error('Permission for notifications was denied.');
      return;
    }

    const publicVapidKey = 'BJPjeR66OOzF7NAgpT9lxOSpCIqjCXhaA97B8-ZGQKFtO-AElc0HjgJjUhtA4xGvu9cO_GTo2fkE-cU1EbeyQCU';
    const convertedVapidKey = Uint8Array.from(
      atob(publicVapidKey.replace(/-/g, '+').replace(/_/g, '/')),
      c => c.charCodeAt(0)
    );

    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      });

      await axios.post('http://localhost:5000/subscribe', subscription);
      console.log('User subscribed to push notifications:', subscription);
    } catch (error) {
      console.error('Failed to subscribe to push notifications', error);
    }
  };

  const handleStart = async () => {
    if (username) {
      try {
        const response = await axios.post('http://localhost:5000/start-messages', { username });
        alert(response.data.message); // Use response data from the server
      } catch (error) {
        console.error('Error starting messages:', error);
        alert('Failed to start messages. Please check the console for more details.');
      }
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Message Notification App
          </Typography>
          <IconButton color="inherit" onClick={toggleDarkMode}>
            {darkMode ? <WbSunny /> : <Nightlight />}
          </IconButton>
        </Toolbar>
      </AppBar>
      <Container maxWidth="sm" sx={{ textAlign: 'center', marginTop: 5, bgcolor: 'background.default', padding: 3, borderRadius: 2 }}>
        <TextField
          variant="outlined"
          label="Enter your name"
          fullWidth
          margin="normal"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          sx={{ input: { color: darkMode ? '#ffffff' : '#000000' }, bgcolor: darkMode ? '#424242' : '#ffffff' }} // Set input color and background
        />
        <Button variant="contained" onClick={handleStart} fullWidth sx={{ bgcolor: darkMode ? '#ffffff' : '#000000', color: darkMode ? '#000000' : '#ffffff' }}>
          Start Messages
        </Button>
      </Container>
    </ThemeProvider>
  );
};

export default App;
