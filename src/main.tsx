import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import PlainLanguage from './PlainLanguage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PlainLanguage />
    <App />
  </StrictMode>,
)
