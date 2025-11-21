import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import './index.css'
import App from './App.jsx'
import { store } from './redux/store.js'
// Set axios global defaults (withCredentials, etc.)
import './redux/slice/axiosInstance.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
   </StrictMode>,
)
