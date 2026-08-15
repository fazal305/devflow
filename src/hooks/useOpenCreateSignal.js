import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

/**
 * Lets the command palette trigger a page's "create" flow via
 * `navigate(path, { state: { openCreate: true } })`. Runs `onOpen` once,
 * then clears the navigation state so back/forward or a re-render doesn't
 * reopen the form.
 */
export function useOpenCreateSignal(onOpen) {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (location.state?.openCreate) {
      onOpen()
      navigate(location.pathname + location.search, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state])
}
