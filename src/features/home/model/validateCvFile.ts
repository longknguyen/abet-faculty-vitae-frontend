const MAXIMUM_CV_BYTES = 10 * 1024 * 1024
const ALLOWED_EXTENSIONS = new Set(['doc', 'docx', 'pdf'])
const ALLOWED_MEDIA_TYPES = new Set([
  'application/msword',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])

export function validateCvFile(file: File): string | undefined {
  const extension = file.name.split('.').pop()?.toLowerCase()

  if (extension === undefined || !ALLOWED_EXTENSIONS.has(extension)) {
    return 'Choose a PDF or Word document.'
  }
  if (file.size === 0) {
    return 'The selected document is empty.'
  }
  if (file.size > MAXIMUM_CV_BYTES) {
    return 'The selected document must be 10 MB or smaller.'
  }
  if (file.type !== '' && !ALLOWED_MEDIA_TYPES.has(file.type)) {
    return 'The selected file does not appear to be a PDF or Word document.'
  }

  return undefined
}
