import { Modal } from '../../../shared/components/Modal'
import type { FacultyRecord } from '../model/homeSchemas'
import { StatusBadge } from './StatusBadge'

interface FacultyRecordDialogProps {
  onClose: () => void
  record?: FacultyRecord
}

export function FacultyRecordDialog({ onClose, record }: FacultyRecordDialogProps) {
  return (
    <Modal open={record !== undefined} onClose={onClose} title="Faculty Vitae">
      {record !== undefined && (
        <div>
          <p className="mb-4 text-sm text-slate-500 dark:text-slate-300">{record.displayName}</p>
          <StatusBadge status={record.status} />
          {record.status === null ? <p className="mt-6 text-sm text-slate-600 dark:text-slate-300">No faculty vitae has been created for this cycle.</p> : <p className="mt-6 text-sm leading-6 text-slate-600 dark:text-slate-300">Detailed faculty vitae content requires the review endpoint and is not included in the home summary response.</p>}
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" className="text-button" onClick={onClose}>Back to Overview</button>
          </div>
        </div>
      )}
    </Modal>
  )
}
