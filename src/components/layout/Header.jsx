import { Icon } from '../common/Icon'
import { useTheme } from '../../context/ThemeContext'
import { useNetwork } from '../../context/NetworkContext'
import './Header.css'

const THEME_ICON = { dark: 'moon', light: 'sun', system: 'monitor' }

export function Header({ onToggleSidebar, onOpenCommandPalette }) {
  const { mode, cycleMode } = useTheme()
  const { isOnline } = useNetwork()

  return (
    <header className="app-header">
      <button
        className="app-header__menu-btn"
        aria-label="Toggle navigation"
        aria-controls="primary-navigation"
        onClick={onToggleSidebar}
      >
        <Icon name="menu" size={20} />
      </button>

      <div className="app-header__brand">
        <span className="app-header__logo" aria-hidden="true">
          <Icon name="command" size={18} />
        </span>
        <span className="app-header__wordmark">DevFlow</span>
      </div>

      <button
        className="app-header__search"
        onClick={onOpenCommandPalette}
        aria-label="Open command palette"
      >
        <Icon name="search" size={16} />
        <span>Search DevFlow…</span>
        <kbd>Ctrl K</kbd>
      </button>

      <div className="app-header__status">
        <span
          className={`network-badge${isOnline ? '' : ' network-badge--offline'}`}
          title={isOnline ? 'Online' : 'Offline'}
        >
          <Icon name={isOnline ? 'online' : 'offline'} size={16} />
          <span className="network-badge__label">{isOnline ? 'Online' : 'Offline'}</span>
        </span>

        <button
          className="app-header__icon-btn"
          onClick={cycleMode}
          aria-label={`Theme: ${mode}. Click to change.`}
          title={`Theme: ${mode}`}
        >
          <Icon name={THEME_ICON[mode]} size={18} />
        </button>
      </div>
    </header>
  )
}
