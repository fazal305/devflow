/** Plain browser download — the universal fallback when File System Access isn't available. */
export function downloadBlob(content, filename, mimeType) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function isFileSystemAccessSupported() {
  return typeof window.showSaveFilePicker === 'function' && typeof window.showOpenFilePicker === 'function'
}

/** True when the picker was closed without choosing a file — not a real failure. */
export function isUserCancellation(error) {
  return error?.name === 'AbortError'
}

/**
 * Saves text content via the native "Save As" picker. Falls back to the
 * caller-provided `fallback` (typically a Blob download) when the API is
 * unsupported or the user cancels.
 */
export async function saveTextFile(content, { suggestedName, mimeType, extension, fallback }) {
  if (!isFileSystemAccessSupported()) {
    fallback()
    return 'fallback'
  }

  try {
    const handle = await window.showSaveFilePicker({
      suggestedName,
      types: [{ description: 'DevFlow file', accept: { [mimeType]: [extension] } }],
    })
    const writable = await handle.createWritable()
    await writable.write(content)
    await writable.close()
    return 'saved'
  } catch (error) {
    if (isUserCancellation(error)) return 'cancelled'
    fallback()
    return 'fallback'
  }
}

/**
 * Opens a file via the native file picker and returns a File. Falls back to
 * the caller-provided `fallback`, typically a click on a hidden <input type=file>.
 */
export async function openTextFile({ mimeType, extension, fallback }) {
  if (!isFileSystemAccessSupported()) {
    fallback()
    return null
  }

  try {
    const [handle] = await window.showOpenFilePicker({
      types: [{ description: 'DevFlow file', accept: { [mimeType]: [extension] } }],
      multiple: false,
    })
    return handle.getFile()
  } catch (error) {
    if (isUserCancellation(error)) return null
    fallback()
    return null
  }
}
