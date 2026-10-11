// React entry point: mounts the app and global styles into the DOM.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AccessibleMotion } from './components/AccessibleMotion.jsx'

// Mount the React app into the root DOM node.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AccessibleMotion>
      <App />
    </AccessibleMotion>
  </StrictMode>,
)
