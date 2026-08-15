import { useCallback, useEffect, useState } from 'react'
import { isServiceWorkerSupported, registerServiceWorker, activateWaitingWorker } from '../services/serviceWorker'

export function useServiceWorker() {
  const [status, setStatus] = useState('unsupported') // unsupported | registering | active | update-available | error
  const [registration, setRegistration] = useState(null)

  useEffect(() => {
    if (!isServiceWorkerSupported()) {
      setStatus('unsupported')
      return
    }

    setStatus('registering')
    registerServiceWorker({
      onUpdate: (reg) => {
        setRegistration(reg)
        setStatus('update-available')
      },
    })
      .then((reg) => {
        if (!reg) {
          setStatus('unsupported')
          return
        }
        setRegistration(reg)
        setStatus(reg.active ? 'active' : 'registering')
      })
      .catch(() => setStatus('error'))
  }, [])

  const activateUpdate = useCallback(() => activateWaitingWorker(registration), [registration])

  return { status, activateUpdate }
}
