import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { AppProvider } from './context/AppContext'
import { TradingProvider } from './context/TradingContext'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <TradingProvider>
            <App />
          </TradingProvider>
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
)

