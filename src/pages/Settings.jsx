import { PageHeader } from '../components/common/PageHeader'
import { useTheme } from '../context/ThemeContext'
import { Icon } from '../components/common/Icon'
import { DbDiagnostics } from '../components/storage/DbDiagnostics'
import { ImportExportPanel } from '../components/settings/ImportExportPanel'
import { useInstallPrompt } from '../hooks/useInstallPrompt'
import './Settings.css'

const THEME_OPTIONS = [
  { value: 'dark', label: 'Dark', icon: 'moon' },
  { value: 'light', label: 'Light', icon: 'sun' },
  { value: 'system', label: 'System', icon: 'monitor' },
]

export default function Settings() {
  const { mode, setMode } = useTheme()
  const { available: installAvailable, installed, install } = useInstallPrompt()

  return (
    <>
      <PageHeader title="Settings" description="Workspace preferences, stored locally on this device." />

      <section className="settings-section">
        <h2 className="settings-section__title">App</h2>
        <div className="settings-install">
          {installed ? (
            <p className="settings-install__status">
              <Icon name="check" size={15} />
              DevFlow is installed and running as a standalone app.
            </p>
          ) : installAvailable ? (
            <button className="settings-install__button" onClick={install}>
              <Icon name="download" size={15} />
              Install DevFlow
            </button>
          ) : (
            <p className="settings-install__status settings-install__status--muted">
              Install isn't available right now — your browser may not support it, or DevFlow may already be
              installed.
            </p>
          )}
        </div>
      </section>

      <section className="settings-section">
        <h2 className="settings-section__title">Appearance</h2>
        <div className="theme-picker" role="radiogroup" aria-label="Theme">
          {THEME_OPTIONS.map((option) => (
            <button
              key={option.value}
              role="radio"
              aria-checked={mode === option.value}
              className={`theme-picker__option${mode === option.value ? ' theme-picker__option--active' : ''}`}
              onClick={() => setMode(option.value)}
            >
              <Icon name={option.icon} size={18} />
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <section className="settings-section">
        <h2 className="settings-section__title">Workspace data</h2>
        <DbDiagnostics />
      </section>

      <section className="settings-section">
        <h2 className="settings-section__title">Import / export</h2>
        <ImportExportPanel />
      </section>
    </>
  )
}
