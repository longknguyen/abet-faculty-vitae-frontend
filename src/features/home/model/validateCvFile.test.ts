import { validateCvFile } from './validateCvFile'

describe('validateCvFile', () => {
  it('accepts a PDF within the client-side limit', () => {
    const file = new File(['content'], 'vitae.pdf', { type: 'application/pdf' })
    expect(validateCvFile(file)).toBeUndefined()
  })

  it('rejects a misleading extension and media-type combination', () => {
    const file = new File(['content'], 'vitae.pdf', { type: 'text/html' })
    expect(validateCvFile(file)).toContain('does not appear')
  })

  it('rejects files larger than 10 MB', () => {
    const file = new File([new Uint8Array(10 * 1024 * 1024 + 1)], 'vitae.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    })
    expect(validateCvFile(file)).toContain('10 MB')
  })
})
