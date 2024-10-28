import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, TextField, Button, IconButton, ThemeProvider, createTheme, Box, CssBaseline } from '@mui/material';
import Nightlight from '@mui/icons-material/Nightlight';
import WbSunny from '@mui/icons-material/WbSunny';
import toast, { Toaster } from 'react-hot-toast'; // Correct import for toast and Toaster

const App: React.FC = () => {
  const [username, setUsername] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  // Load dark mode preference from localStorage on initial load
  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode) {
      setDarkMode(savedMode === 'true');
    }
  }, []);

  // Toggle between light and dark modes and save to localStorage
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
  };

  // Create Material-UI theme based on the dark mode state
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      background: {
        default: darkMode ? '#000000' : '#ffffff',
        paper: darkMode ? '#000000' : '#ffffff',
      },
      text: {
        primary: darkMode ? '#ffffff' : '#000000',
      },
    },
    typography: {
      fontFamily: '"Oxanium", sans-serif',
    },
  });

  useEffect(() => {
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
        toast.success(response.data.message); // Use react-hot-toast for success messages
        setUsername(''); // Clear the input field after success
      } catch (error) {
        console.error('Error starting messages:', error);
        toast.error('Failed to start messages. Please check the console for more details.', {
          duration: 5000, // Display for 5 seconds
          icon: '❌', // Optional: Add an icon
          position: 'top-center', // Optional: Position of the toast
        });
      }
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Toaster /> {/* Include the Toaster */}
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        width="100vw"
        height="100vh"
        bgcolor="background.default"
        overflow="hidden"
      >
        <IconButton
          onClick={toggleDarkMode}
          disableRipple // Disable the ripple effect
          sx={{
            position: 'absolute',
            top: 16,
            right: 'calc(50% - 280px)',
            color: darkMode ? '#ffffff' : 'inherit',
            bgcolor: 'transparent', // Ensure the background is transparent
            '&:hover': {
              bgcolor: 'transparent', // Remove hover background color
            },
            '&:active': {
              bgcolor: 'transparent', // Remove active background color
            },
          }}
        >
          {darkMode ? <WbSunny /> : <Nightlight />}
        </IconButton>
        <Container
          maxWidth="sm"
          sx={{
            textAlign: 'center',
            mt: 8,
            bgcolor: 'background.default',
            p: 3,
            borderRadius: 2,
          }}
        >
          <TextField
            variant="outlined"
            label="Enter your name"
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{
              input: { color: darkMode ? '#ffffff' : '#000000' },
              bgcolor: darkMode ? '#424242' : '#ffffff',
              '& label': {
                color: darkMode ? '#ffffff' : '#000000',
              },
              '& label.Mui-focused': {
                color: darkMode ? '#ffffff' : '#000000',
              },
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: darkMode ? '#ffffff' : '#000000',
                },
                '&:hover fieldset': {
                  borderColor: darkMode ? '#ffffff' : '#000000',
                },
                '&.Mui-focused fieldset': {
                  borderColor: darkMode ? '#ffffff' : '#000000',
                },
              },
            }}
          />
          <Button
            variant="contained"
            onClick={handleStart}
            fullWidth
            sx={{
              bgcolor: darkMode ? '#ffffff' : '#000000',
              color: darkMode ? '#000000' : '#ffffff',
            }}
          >
            Start Messages
          </Button>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default App;
