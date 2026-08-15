import { useState } from 'react'
import { getNavigationTiming } from '../utils/performance'

export function useNavigationTiming() {
  const [timing] = useState(() => getNavigationTiming())
  return timing
}
