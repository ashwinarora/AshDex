import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiRequestError } from '@nktkas/hyperliquid'
import { toastSdkError } from './toastSdkError'

// Hoisted mocks — Vitest inlines these before the module under test loads.
const toastMock = vi.hoisted(() => ({
  error: vi.fn(),
  info: vi.fn(),
  loading: vi.fn(),
  success: vi.fn()
}))

vi.mock('sonner', () => ({ toast: toastMock }))

// Silence console.error in tests — we assert it's called separately when we
// care, but it clutters the runner output by default.
beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('toastSdkError', () => {
  describe('happy paths — real error messages surface', () => {
    it('extracts message from a plain Error', () => {
      toastSdkError(new Error('specific problem'), 'fallback')
      expect(toastMock.error).toHaveBeenCalledWith('specific problem', undefined)
    })

    it('extracts message from an ApiRequestError', () => {
      // Construct a minimal ApiRequestError-shaped object. In tests we don't
      // want to hit the real SDK constructor which requires a live request.
      const apiErr = Object.assign(Object.create(ApiRequestError.prototype), {
        message: 'Order must have minimum value of $10',
        name: 'ApiRequestError'
      })
      toastSdkError(apiErr, 'fallback')
      expect(toastMock.error).toHaveBeenCalledWith(
        'Order must have minimum value of $10',
        undefined
      )
    })

    it('extracts message from a string throw', () => {
      toastSdkError('bare string', 'fallback')
      expect(toastMock.error).toHaveBeenCalledWith('bare string', undefined)
    })

    it('extracts message from a plain object with a message property', () => {
      toastSdkError({ message: 'object-shaped' }, 'fallback')
      expect(toastMock.error).toHaveBeenCalledWith('object-shaped', undefined)
    })

    it('forwards the toast id option (so a loading toast can be replaced in place)', () => {
      toastSdkError(new Error('boom'), 'fallback', { id: 'toast-42' })
      expect(toastMock.error).toHaveBeenCalledWith('boom', { id: 'toast-42' })
    })
  })

  describe('user cancellation — downgrades to info', () => {
    it('recognises EIP-1193 code 4001', () => {
      toastSdkError({ code: 4001, message: 'User rejected the request' }, 'fallback')
      expect(toastMock.info).toHaveBeenCalledWith('Signature request cancelled', undefined)
      expect(toastMock.error).not.toHaveBeenCalled()
    })

    it("recognises viem's UserRejectedRequestError by name", () => {
      const e = new Error('boom')
      e.name = 'UserRejectedRequestError'
      toastSdkError(e, 'fallback')
      expect(toastMock.info).toHaveBeenCalledWith('Signature request cancelled', undefined)
    })

    it('recognises viem-wrapped errors via .cause', () => {
      const wrapped = { message: 'wrapper', cause: { code: 4001 } }
      toastSdkError(wrapped, 'fallback')
      expect(toastMock.info).toHaveBeenCalledWith('Signature request cancelled', undefined)
    })

    it('recognises string patterns like "user rejected"', () => {
      toastSdkError(new Error('User denied signature'), 'fallback')
      expect(toastMock.info).toHaveBeenCalledWith('Signature request cancelled', undefined)
    })

    it('does not infinite-loop on self-referential cause', () => {
      const e: { message: string; cause?: unknown } = { message: 'x' }
      e.cause = e
      // Should terminate and fall through to normal error handling.
      toastSdkError(e, 'fallback')
      expect(toastMock.error).toHaveBeenCalledWith('x', undefined)
    })
  })

  describe('fallbacks', () => {
    it('uses the fallback string when the error has no message', () => {
      toastSdkError({}, 'action failed')
      expect(toastMock.error).toHaveBeenCalledWith('action failed', undefined)
    })

    it('uses the fallback string when the error is null', () => {
      toastSdkError(null, 'fallback')
      expect(toastMock.error).toHaveBeenCalledWith('fallback', undefined)
    })

    it('uses the fallback string when the error is undefined', () => {
      toastSdkError(undefined, 'fallback')
      expect(toastMock.error).toHaveBeenCalledWith('fallback', undefined)
    })

    it('does not surface an empty-string message', () => {
      toastSdkError(new Error(''), 'fallback')
      expect(toastMock.error).toHaveBeenCalledWith('fallback', undefined)
    })
  })

  describe('always logs the raw error', () => {
    it('console.errors the fallback and error together', () => {
      const spy = vi.spyOn(console, 'error')
      const e = new Error('boom')
      toastSdkError(e, 'fallback')
      expect(spy).toHaveBeenCalledWith('fallback', e)
    })
  })
})
