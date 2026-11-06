import { useState, type SyntheticEvent } from 'react'
import { FileText, LoaderCircle } from 'lucide-react'

import { Modal } from '../../../shared/components/Modal'
import type { CvUploadState } from '../hooks/useHomeController'
import { validateCvFile } from '../model/validateCvFile'

interface CvUploadDialogProps {
  open: boolean
  state: CvUploadState
  onClose: () => void
  onUpload: (file: File) => Promise<void>
}

const stageLabels = {
  COMPLETE: 'Finishing Your Review',
  CREATING_REVIEW: 'Creating Your Review',
  EXTRACTING_TEXT: 'Reading Your CV',
  QUEUED: 'Waiting to Process',
  STRUCTURING_WITH_AI: 'Organizing Your Information',
  VALIDATING: 'Checking Your CV',
} as const

export function CvUploadDialog({
  open,
  state,
  onClose,
  onUpload,
}: CvUploadDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File>()
  const [validationError, setValidationError] = useState<string | null>(null)
  const busy = state.status === 'uploading' || state.status === 'processing'

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    if (selectedFile === undefined) {
      setValidationError('Choose a PDF or DOCX file.')
      return
    }
    const error = validateCvFile(selectedFile)
    if (error !== undefined) {
      setValidationError(error)
      return
    }
    setValidationError(null)
    await onUpload(selectedFile)
  }

  return (
    <Modal open={open} onClose={onClose} title="Import CV">
      <form className="grid gap-6" onSubmit={(event) => { void handleSubmit(event) }}>
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
          Choose the current CV you want to use. PDF or DOCX, up to 10 MB.
        </p>

        <label className="block rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm transition hover:border-blue-500 dark:border-white/20 dark:bg-[#1c1a22]">
          <span className="flex items-center gap-3 font-medium">
            <span className="grid size-10 place-items-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-200">
              <FileText aria-hidden="true" size={18} />
            </span>
            {selectedFile?.name ?? 'Choose a File'}
          </span>
          <input
            type="file"
            className="sr-only"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            disabled={busy}
            onChange={(event) => {
              const file = event.target.files?.[0]
              setSelectedFile(file)
              setValidationError(file === undefined ? null : validateCvFile(file) ?? null)
            }}
          />
          <span className="mt-2 block text-xs font-normal text-slate-500 dark:text-slate-400">
            {selectedFile === undefined
              ? 'Select from your device'
              : `${(selectedFile.size / 1024 / 1024).toFixed(1)} MB`}
          </span>
        </label>

        {state.status === 'processing' && (
          <div className="flex items-center gap-3 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-950 dark:bg-blue-950 dark:text-blue-100" role="status">
            <LoaderCircle aria-hidden="true" className="animate-spin" size={18} />
            <span>{stageLabels[state.stage]}</span>
          </div>
        )}
        {state.status === 'complete' && (
          <p className="text-sm text-emerald-700 dark:text-emerald-300" role="status">
            Your CV is ready to review.
          </p>
        )}
        {state.status === 'failed' && (
          <p className="text-sm text-red-600 dark:text-red-300" role="alert">{state.message}</p>
        )}
        {validationError !== null && (
          <p className="text-sm text-red-600 dark:text-red-300" role="alert">{validationError}</p>
        )}

        <div className="flex flex-wrap gap-5">
          {state.status !== 'complete' && (
            <button type="submit" className="primary-button" disabled={busy}>
              {state.status === 'uploading' ? 'Uploading…' : busy ? 'Processing…' : 'Import CV'}
            </button>
          )}
          <button type="button" className="text-button" onClick={onClose}>
            {state.status === 'complete' ? 'Continue' : 'Cancel'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
