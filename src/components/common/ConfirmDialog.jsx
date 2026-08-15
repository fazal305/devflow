import { Modal } from './Modal'
import './ConfirmDialog.css'

/** Reused wherever a destructive action needs confirmation (delete project, note, task, snippet…). */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  danger = true,
}) {
  return (
    <Modal open={open} onClose={onClose} labelledBy="confirm-dialog-title" className="confirm-dialog">
      <h2 id="confirm-dialog-title" className="confirm-dialog__title">
        {title}
      </h2>
      <p className="confirm-dialog__description">{description}</p>
      <div className="confirm-dialog__actions">
        <button className="confirm-dialog__cancel" onClick={onClose}>
          Cancel
        </button>
        <button
          className={danger ? 'confirm-dialog__confirm confirm-dialog__confirm--danger' : 'confirm-dialog__confirm'}
          onClick={() => {
            onConfirm()
            onClose()
          }}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
