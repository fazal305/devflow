import { Icon } from './Icon'
import './UpdateBanner.css'

export function UpdateBanner({ onActivate }) {
  return (
    <div className="update-banner" role="status">
      <Icon name="download" size={15} />
      <span>A new version of DevFlow is ready.</span>
      <button onClick={onActivate}>Reload to update</button>
    </div>
  )
}
