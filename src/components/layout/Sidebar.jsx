import { NavLink } from 'react-router-dom'
import { Icon } from '../common/Icon'
import { navigationItems } from '../../config/navigation'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import './Sidebar.css'

export function Sidebar({ open, onNavigate }) {
  const isMobile = useMediaQuery('(max-width: 767px)')
  const offCanvasClosed = isMobile && !open

  return (
    <>
      <nav
        id="primary-navigation"
        className={`sidebar${open ? ' sidebar--open' : ''}`}
        aria-label="Primary"
        inert={offCanvasClosed}
      >
        <ul className="sidebar__list">
          {navigationItems.map((item) => (
            <li key={item.id}>
              <NavLink
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `sidebar__link${isActive ? ' sidebar__link--active' : ''}`
                }
                onClick={onNavigate}
              >
                <Icon name={item.icon} size={18} />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      {open && <div className="sidebar__scrim" onClick={onNavigate} aria-hidden="true" />}
    </>
  )
}
