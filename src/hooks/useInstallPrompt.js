import { useEffect, useState } from 'react'
import { isInstallAvailable, subscribeInstallAvailability, promptInstall, isStandalone } from '../services/pwa'

export function useInstallPrompt() {
  const [available, setAvailable] = useState(isInstallAvailable())
  const [installed, setInstalled] = useState(isStandalone())

  useEffect(() => subscribeInstallAvailability(setAvailable), [])

  const install = async () => {
    const choice = await promptInstall()
    setAvailable(false)
    if (choice?.outcome === 'accepted') setInstalled(true)
  }

  return { available, installed, install }
}
