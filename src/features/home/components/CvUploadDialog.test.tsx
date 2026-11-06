import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { CvUploadDialog } from './CvUploadDialog'

describe('CvUploadDialog', () => {
  it('validates the selected file before uploading', async () => {
    const upload = vi.fn().mockResolvedValue(undefined)
    render(
      <CvUploadDialog
        open
        state={{ status: 'idle' }}
        onClose={() => {}}
        onUpload={upload}
      />,
    )
    const input = screen.getByLabelText(/choose a file/i)
    const invalidFile = new File(['unsafe'], 'vitae.html', { type: 'text/html' })

    fireEvent.change(input, { target: { files: [invalidFile] } })
    fireEvent.click(screen.getByRole('button', { name: 'Import CV' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Choose a PDF or Word document.')
    expect(upload).not.toHaveBeenCalled()
  })

  it('submits a valid PDF and presents processing progress', async () => {
    const upload = vi.fn().mockResolvedValue(undefined)
    const { rerender } = render(
      <CvUploadDialog
        open
        state={{ status: 'idle' }}
        onClose={() => {}}
        onUpload={upload}
      />,
    )
    const input = screen.getByLabelText(/choose a file/i)
    const file = new File(['%PDF-test'], 'vitae.pdf', { type: 'application/pdf' })

    fireEvent.change(input, { target: { files: [file] } })
    fireEvent.click(screen.getByRole('button', { name: 'Import CV' }))

    await waitFor(() => {
      expect(upload).toHaveBeenCalledWith(file)
    })

    rerender(
      <CvUploadDialog
        open
        state={{ status: 'processing', filename: file.name, stage: 'EXTRACTING_TEXT' }}
        onClose={() => {}}
        onUpload={upload}
      />,
    )
    expect(screen.getByRole('status')).toHaveTextContent('Reading Your CV')
  })
})
