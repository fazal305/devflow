import { useRef, useState } from 'react'
import { Modal } from '../common/Modal'
import { Icon } from '../common/Icon'
import { useWorkspace } from '../../context/WorkspaceContext'
import { exportWorkspace, readWorkspaceFile, importWorkspace } from '../../services/importExport'
import { isFileSystemAccessSupported, openTextFile } from '../../services/fileSystem'
import './ImportExportPanel.css'

const LABELS = {
  projects: 'Projects',
  notes: 'Notes',
  tasks: 'Tasks',
  snippets: 'Snippets',
  activity: 'Activity',
}

export function ImportExportPanel() {
  const { refreshAll } = useWorkspace()
  const fileInputRef = useRef(null)
  const fsaSupported = isFileSystemAccessSupported()

  const [exportStatus, setExportStatus] = useState('idle') // idle | exporting | done | error
  const [report, setReport] = useState(null) // validation report shown in the preview dialog
  const [importStatus, setImportStatus] = useState('idle') // idle | importing | done | error
  const [importError, setImportError] = useState(null)

  const handleExport = async () => {
    setExportStatus('exporting')
    try {
      const { outcome } = await exportWorkspace()
      setExportStatus(outcome === 'cancelled' ? 'idle' : 'done')
    } catch {
      setExportStatus('error')
    } finally {
      setTimeout(() => setExportStatus('idle'), 2000)
    }
  }

  const processFile = async (file) => {
    if (!file) return
    setImportError(null)
    const result = await readWorkspaceFile(file)
    if (!result.valid) {
      setImportError(result.errors)
      return
    }
    setReport(result)
  }

  const handleChooseFile = async () => {
    if (fsaSupported) {
      const file = await openTextFile({
        mimeType: 'application/json',
        extension: '.json',
        fallback: () => fileInputRef.current?.click(),
      })
      if (file) processFile(file)
      return
    }
    fileInputRef.current?.click()
  }

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    event.target.value = '' // allow re-selecting the same file later
    processFile(file)
  }

  const handleConfirmImport = async () => {
    if (!report?.cleaned) return
    setImportStatus('importing')
    try {
      await importWorkspace(report.cleaned)
      await refreshAll()
      setImportStatus('done')
      setReport(null)
      setTimeout(() => setImportStatus('idle'), 2500)
    } catch (err) {
      setImportStatus('error')
      setImportError([err.message])
      setReport(null)
    }
  }

  return (
    <div className="import-export">
      <p className="import-export__capability">
        <Icon name={fsaSupported ? 'check' : 'close'} size={13} />
        File System Access API: {fsaSupported ? 'supported — native file picker used' : 'unsupported — using download/upload fallback'}
      </p>

      <div className="import-export__actions">
        <div className="import-export__action">
          <div>
            <h3>Export workspace</h3>
            <p>Save every project, note, task, snippet, and activity entry as a JSON file.</p>
          </div>
          <button onClick={handleExport} disabled={exportStatus === 'exporting'}>
            <Icon name="download" size={15} />
            {exportStatus === 'exporting'
              ? 'Exporting…'
              : exportStatus === 'done'
                ? 'Saved'
                : exportStatus === 'error'
                  ? 'Export failed'
                  : 'Export'}
          </button>
        </div>

        <div className="import-export__action">
          <div>
            <h3>Import workspace</h3>
            <p>Restore from a previously exported JSON file. Existing data is never deleted.</p>
          </div>
          <button onClick={handleChooseFile}>
            <Icon name="upload" size={15} />
            Choose file…
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            onChange={handleFileChange}
            className="visually-hidden"
          />
        </div>
      </div>

      {importError && (
        <div className="import-export__error">
          {importError.map((msg) => (
            <p key={msg}>{msg}</p>
          ))}
        </div>
      )}

      {importStatus === 'done' && <p className="import-export__success">Workspace imported successfully.</p>}

      <Modal open={Boolean(report)} onClose={() => setReport(null)} labelledBy="import-preview-title">
        <div className="import-preview">
          <h2 id="import-preview-title">Import preview</h2>

          <div className="import-preview__counts">
            {Object.entries(LABELS).map(([key, label]) => (
              <div key={key} className="import-preview__count">
                <span className="import-preview__count-value">{report?.counts?.[key]?.valid ?? 0}</span>
                <span className="import-preview__count-label">{label}</span>
              </div>
            ))}
          </div>

          {report?.errors?.length > 0 && (
            <div className="import-preview__warnings">
              {report.errors.map((msg) => (
                <p key={msg}>{msg}</p>
              ))}
            </div>
          )}

          <div className="import-preview__actions">
            <button className="import-preview__cancel" onClick={() => setReport(null)}>
              Cancel
            </button>
            <button
              className="import-preview__confirm"
              onClick={handleConfirmImport}
              disabled={importStatus === 'importing'}
            >
              {importStatus === 'importing' ? 'Importing…' : 'Import Workspace'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
