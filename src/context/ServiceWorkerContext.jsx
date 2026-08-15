import { createContext, useContext } from 'react'
import { useServiceWorker } from '../hooks/useServiceWorker'

const ServiceWorkerContext = createContext(null)

export function ServiceWorkerProvider({ children }) {
  const value = useServiceWorker()
  return <ServiceWorkerContext.Provider value={value}>{children}</ServiceWorkerContext.Provider>
}

export function useServiceWorkerStatus() {
  const ctx = useContext(ServiceWorkerContext)
  if (!ctx) throw new Error('useServiceWorkerStatus must be used within ServiceWorkerProvider')
  return ctx
}
