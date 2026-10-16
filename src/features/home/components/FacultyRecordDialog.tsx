import { Modal } from '../../../shared/components/Modal'
import type { FacultyRecord } from '../model/homeSchemas'
import { StatusBadge } from './StatusBadge'

interface FacultyRecordDialogProps {
  error?: string
  onClose: () => void
  onVerify: (record: FacultyRecord) => Promise<boolean>
  pending: boolean
  record?: FacultyRecord
}

export function FacultyRecordDialog({ error, onClose, onVerify, pending, record }: FacultyRecordDialogProps) {
  return (
    <Modal open={record !== undefined} onClose={onClose} title="Faculty vitae">
      {record !== undefined && (
        <div>
          <p className="mb-4 text-sm text-slate-500 dark:text-slate-300">{record.displayName}</p>
          <StatusBadge status={record.status} />
          {record.status === null ? <p className="mt-6 text-sm text-slate-600 dark:text-slate-300">No faculty vitae has been created for this cycle.</p> : <p className="mt-6 text-sm leading-6 text-slate-600 dark:text-slate-300">Detailed faculty vitae content requires the review endpoint and is not included in the home summary response.</p>}
          {error !== undefined && <p className="mt-4 text-sm text-red-700 dark:text-red-300" role="alert">{error}</p>}
          <div className="mt-6 flex flex-wrap gap-3">
            {record.status === 'SUBMITTED' && record.facultyCycleRecordId !== null && record.version !== null && <button type="button" className="primary-button" disabled={pending} onClick={() => void onVerify(record)}>{pending ? 'Verifying…' : 'Mark verified'}</button>}
            <button type="button" className="text-button" onClick={onClose}>Back to overview</button>
          </div>
        </div>
      )}
    </Modal>
  )
}
