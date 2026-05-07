import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import Swal from 'sweetalert2'

const getThemeColor = () => {
  if (typeof window === 'undefined') return '#5f8f87'
  const color = getComputedStyle(document.documentElement).getPropertyValue('--st-sweetalert').trim()
  return color || '#5f8f87'
}

const mergeSweetAlertClasses = (customClass = {}) => ({
  ...customClass,
  popup: ['rounded-2xl', customClass.popup].filter(Boolean).join(' '),
  confirmButton: ['rounded-xl font-semibold px-4 py-2', customClass.confirmButton].filter(Boolean).join(' '),
  cancelButton: ['rounded-xl font-semibold px-4 py-2', customClass.cancelButton].filter(Boolean).join(' '),
})

const themedSwalFire = Swal.fire.bind(Swal)
Swal.fire = (...args) => {
  const primary = getThemeColor()
  const options = typeof args[0] === 'object'
    ? { ...args[0] }
    : { title: args[0], text: args[1], icon: args[2] }

  return themedSwalFire({
    ...options,
    confirmButtonColor: options.confirmButtonColor || primary,
    cancelButtonColor: options.cancelButtonColor || '#6B7280',
    iconColor: options.iconColor || (options.icon === 'error' ? undefined : primary),
    customClass: mergeSweetAlertClasses(options.customClass),
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
