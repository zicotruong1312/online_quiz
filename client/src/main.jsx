import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Removed StrictMode to prevent double Socket connections during development.
createRoot(document.getElementById('root')).render(<App />);
