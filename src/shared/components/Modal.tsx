import { useEffect, useId, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  children: ReactNode
  onClose: () => void
  open: boolean
  title: string
}

export function Modal({ children, onClose, open, title }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog === null) return

    if (open && !dialog.open) {
      returnFocusRef.current = document.activeElement as HTMLElement | null
      dialog.showModal()
    } else if (!open && dialog.open) {
      dialog.close()
      returnFocusRef.current?.focus()
    }
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className="m-auto max-h-[calc(100vh-2rem)] w-[min(34rem,calc(100%-2rem))] overflow-auto rounded-2xl border border-slate-200 bg-white p-0 text-slate-950 shadow-2xl backdrop:bg-slate-950/50 dark:border-white/15 dark:bg-[#29262f] dark:text-white"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClose={() => returnFocusRef.current?.focus()}
    >
      <div className="p-6 sm:p-8">
        <header className="mb-6 flex items-center justify-between gap-4">
          <h2 id={titleId} className="text-2xl font-semibold tracking-tight">{title}</h2>
          <button type="button" className="grid size-11 place-items-center rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-200" onClick={onClose} aria-label="Close dialog">
            <X aria-hidden="true" size={19} />
          </button>
        </header>
        {children}
      </div>
    </dialog>
  )
}
