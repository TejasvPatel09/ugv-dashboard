import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { DataProviderWrapper } from './state/ProviderContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DataProviderWrapper>
      <App />
    </DataProviderWrapper>
  </React.StrictMode>,
)
