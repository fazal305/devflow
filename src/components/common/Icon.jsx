// Minimal hand-authored icon set (stroke-style, 24x24) — avoids an icon-library
// dependency for the ~15 glyphs this app actually needs.
const PATHS = {
  dashboard: 'M4 4h7v7H4V4Zm9 0h7v4h-7V4Zm0 8h7v8h-7v-8ZM4 14h7v6H4v-6Z',
  menu: 'M4 6h16M4 12h16M4 18h16',
  projects: 'M4 6a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6Z',
  tasks: 'M5 6h14M5 12h14M5 18h9 M4 6h.01M4 12h.01M4 18h.01',
  notes: 'M6 3h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm9 0v5h5',
  snippets: 'm9 8-4 4 4 4m6-8 4 4-4 4M13 5l-2 14',
  activity: 'M3 12h4l2 7 4-14 2 7h6',
  storage: 'M4 6c0-1.1 3.6-2 8-2s8 .9 8 2-3.6 2-8 2-8-.9-8-2Zm0 0v12c0 1.1 3.6 2 8 2s8-.9 8-2V6M4 12c0 1.1 3.6 2 8 2s8-.9 8-2',
  performance: 'M3 17 9 9l4 4 8-10M15 3h6v6',
  settings:
    'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm8 3a7.96 7.96 0 0 0-.2-1.8l2-1.6-2-3.4-2.4 1a8 8 0 0 0-3.1-1.8L14 2h-4l-.3 2.4a8 8 0 0 0-3.1 1.8l-2.4-1-2 3.4 2 1.6A8 8 0 0 0 4 12c0 .6.1 1.2.2 1.8l-2 1.6 2 3.4 2.4-1a8 8 0 0 0 3.1 1.8L10 22h4l.3-2.4a8 8 0 0 0 3.1-1.8l2.4 1 2-3.4-2-1.6c.1-.6.2-1.2.2-1.8Z',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm10 17-5.7-5.7',
  command: 'M9 3a3 3 0 1 1 3 3H9V3Zm0 0v18m0-18a3 3 0 1 0-3 3h3M9 21a3 3 0 1 0 3-3v3Zm0 0h6m6-15a3 3 0 1 0-3 3v-3Zm0 0v15m0-15h-6m6 15a3 3 0 1 1-3-3h3Z',
  sun: 'M12 4V2m0 20v-2M4 12H2m20 0h-2M5.6 5.6 4.2 4.2m15.6 15.6-1.4-1.4M5.6 18.4l-1.4 1.4M18.4 5.6l1.4-1.4M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z',
  moon: 'M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z',
  monitor: 'M3 4h18v12H3zM8 20h8M12 16v4',
  online: 'M2 8.5a15 15 0 0 1 20 0M5.5 12a10 10 0 0 1 13 0M9 15.5a5 5 0 0 1 6 0M12 19h.01',
  offline: 'M2 2l20 20M8.5 8.7A15 15 0 0 0 2 8.5m18-1a15 15 0 0 0-3-1.9M5.5 12a10 10 0 0 1 4-2.2m5 .1a10 10 0 0 1 3.5 2.1M9 15.5a5 5 0 0 1 6 0M12 19h.01',
  close: 'M6 6l12 12M18 6 6 18',
  check: 'M5 13l4 4L19 7',
  plus: 'M12 5v14M5 12h14',
  trash: 'M4 7h16M9 7V4h6v3m-7 0 1 13h6l1-13',
  copy: 'M9 9h10v10H9zM5 15V5h10',
  chevronDown: 'M6 9l6 6 6-6',
  sparkle: 'M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6L12 3ZM19 14l.9 2.6L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.4L19 14Z',
  download: 'M12 3v12m0 0-4-4m4 4 4-4M4 21h16',
  upload: 'M12 21V9m0 0-4 4m4-4 4 4M4 3h16',
}

export function Icon({ name, size = 18, className, ...rest }) {
  const d = PATHS[name]
  if (!d) return null
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      <path d={d} />
    </svg>
  )
}
