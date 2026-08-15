import { useState } from 'react'
import { Icon } from './Icon'
import './InstallBanner.css'

export function InstallBanner({ onInstall }) {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  return (
    <div className="install-banner" role="status">
      <Icon name="download" size={15} />
      <span>Install DevFlow for offline access and a standalone window.</span>
      <div className="install-banner__actions">
        <button onClick={onInstall}>Install</button>
        <button className="install-banner__dismiss" onClick={() => setDismissed(true)} aria-label="Dismiss">
          <Icon name="close" size={13} />
        </button>
      </div>
    </div>
  )
}
