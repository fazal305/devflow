import { createContext, useContext } from 'react'
import { useOnlineStatus } from '../hooks/useOnlineStatus'

const NetworkContext = createContext(null)

export function NetworkProvider({ children }) {
  const isOnline = useOnlineStatus()
  return <NetworkContext.Provider value={{ isOnline }}>{children}</NetworkContext.Provider>
}

export function useNetwork() {
  const ctx = useContext(NetworkContext)
  if (!ctx) throw new Error('useNetwork must be used within NetworkProvider')
  return ctx
}
