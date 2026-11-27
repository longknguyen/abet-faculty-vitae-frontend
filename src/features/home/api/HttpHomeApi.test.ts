import { beforeEach, describe, expect, it, vi } from 'vitest'

import { apiFetch } from '../../../shared/http/apiFetch'
import { HttpHomeApi } from './HttpHomeApi'

vi.mock('../../../shared/http/apiFetch')

const jobId = '0199f80f-3bf3-7ed1-b5f8-060591413963'

beforeEach(() => {
  vi.resetAllMocks()
})

describe('HttpHomeApi CV processing', () => {
  it('uploads multipart data without overriding its generated content type', async () => {
    vi.mocked(apiFetch).mockResolvedValue(new Response(JSON.stringify({
      id: '0199f80f-3bf3-7ed1-b5f8-060591413962',
      processingJobId: jobId,
      processingStatus: 'QUEUED',
      originalFilename: 'vitae.pdf',
      detectedMimeType: 'application/pdf',
      fileSizeBytes: 9,
      uploadedAt: '2026-11-05T12:00:00Z',
    }), { status: 201 }))
    const file = new File(['%PDF-test'], 'vitae.pdf', { type: 'application/pdf' })

    const receipt = await new HttpHomeApi().uploadCv(file)

    expect(receipt.processingJobId).toBe(jobId)
    const [, request] = vi.mocked(apiFetch).mock.calls[0] ?? []
    expect(request?.headers).toBeUndefined()
    expect(request?.body).toBeInstanceOf(FormData)
    expect((request?.body as FormData).get('file')).toBe(file)
  })

  it('validates processing status responses', async () => {
    vi.mocked(apiFetch).mockResolvedValue(new Response(JSON.stringify({
      processingJobId: jobId,
      status: 'RUNNING',
      currentStage: 'EXTRACTING_TEXT',
      errorMessage: null,
      queuedAt: '2026-11-05T12:00:00Z',
      startedAt: '2026-11-05T12:00:01Z',
      completedAt: null,
    })))

    const status = await new HttpHomeApi().loadCvProcessingStatus(jobId)

    expect(status.currentStage).toBe('EXTRACTING_TEXT')
    expect(apiFetch).toHaveBeenCalledWith(
      `/api/cv-uploads/jobs/${jobId}`,
      { signal: undefined },
    )
  })
})
