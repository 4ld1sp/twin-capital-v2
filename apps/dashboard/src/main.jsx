import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import { TradingProvider } from './context/TradingContext'
import { LanguageProvider } from './context/LanguageContext'
import './styles/index.css'
import './styles/components.css'
import './styles/layout.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      <AuthProvider>
        <AppProvider>
          <TradingProvider>
            <App />
          </TradingProvider>
        </AppProvider>
      </AuthProvider>
    </LanguageProvider>
  </React.StrictMode>,
)
