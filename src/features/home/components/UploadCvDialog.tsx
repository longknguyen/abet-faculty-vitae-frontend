import { useId, useState, type ChangeEvent, type SyntheticEvent } from 'react'

import { Modal } from '../../../shared/components/Modal'
import { validateCvFile } from '../model/validateCvFile'

interface UploadCvDialogProps {
  error?: string
  onClose: () => void
  onUpload: (file: File) => Promise<boolean>
  open: boolean
  pending: boolean
  replacing: boolean
}

export function UploadCvDialog({ error, onClose, onUpload, open, pending, replacing }: UploadCvDialogProps) {
  const inputId = useId()
  const [file, setFile] = useState<File>()
  const [validationError, setValidationError] = useState<string>()

  function selectFile(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.item(0) ?? undefined
    setFile(selectedFile)
    setValidationError(selectedFile === undefined ? undefined : validateCvFile(selectedFile))
  }

  async function submit(event: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    event.preventDefault()
    if (file === undefined) {
      setValidationError('Choose a document before uploading.')
      return
    }
    const message = validateCvFile(file)
    if (message !== undefined) {
      setValidationError(message)
      return
    }
    if (await onUpload(file)) {
      setFile(undefined)
      onClose()
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={replacing ? 'Replace source CV' : 'Import your CV'}>
      <form onSubmit={(event) => void submit(event)}>
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
          Select the PDF or Word document to use as your source. The server will scan and validate it before extraction.
        </p>
        <label htmlFor={inputId} className="mt-6 grid gap-2 rounded-xl border-2 border-dashed border-slate-200 p-5 text-sm dark:border-white/15">
          <span className="font-medium">PDF or Word document · 10 MB maximum</span>
          <input id={inputId} type="file" accept=".pdf,.doc,.docx" onChange={selectFile} />
        </label>
        {file !== undefined && validationError === undefined && (
          <p className="mt-3 break-all text-sm text-slate-600 dark:text-slate-300" aria-live="polite">
            Selected: {file.name}
          </p>
        )}
        {(validationError ?? error) !== undefined && (
          <p className="mt-3 text-sm text-red-700 dark:text-red-300" role="alert">{validationError ?? error}</p>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="submit" className="primary-button" disabled={pending}>{pending ? 'Uploading…' : 'Upload securely'}</button>
          <button type="button" className="text-button" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </Modal>
  )
}
