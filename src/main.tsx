import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'sonner'
import App from './App'
import './index.css'
import { DashboardProvider } from './hooks/use-dashboard'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DashboardProvider>
      <Toaster theme="dark" position="top-right" richColors />
      <App />
    </DashboardProvider>
  </React.StrictMode>,
)
