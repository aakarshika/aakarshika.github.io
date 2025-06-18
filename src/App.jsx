// File: src/App.jsx

import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import MainRoutingPage from './pages/MainRoutingPage';

/**
 * Main App component that wraps the application with necessary providers and routing
 */
const App = () => {
  useEffect(() => {
    // Handle status bar for mobile platforms
    if (Capacitor.isNativePlatform()) {
      StatusBar.setOverlaysWebView({ overlay: true });
      StatusBar.setStyle({ style: Style.Light });
    }
  }, []);

  return (
    <BrowserRouter>
        <MainRoutingPage />
    </BrowserRouter>
  );
};

export default App;