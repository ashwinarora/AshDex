import { ApiRequestError } from '@nktkas/hyperliquid'
import { toast } from 'sonner'

/**
 * Shared error-to-toast helper for every SDK write path (order, cancel,
 * transfer, withdraw, close, TP/SL, leverage, isolated-margin, scale, etc.).
 *
 * Replaces the ~23 sites that did:
 *
 *     catch (e) {
 *       console.error('...', e)
 *       toast.error('Something went wrong, check the console or contact support', { id })
 *     }
 *
 * with a single call that:
 *   - Extracts the real Hyperliquid error message when `e` is an
 *     `ApiRequestError` (so users see "Post only order would have immediately
 *     matched" instead of "Something went wrong").
 *   - Detects wallet-cancellation (EIP-1193 error code 4001 or `viem`'s
 *     `UserRejectedRequestError`) and downgrades to an `info` toast — a
 *     cancelled signature is a deliberate user action, not an error.
 *   - Falls back to the caller-supplied string for anything else, so users
 *     don't see cryptic internal errors.
 *
 * The raw error is always `console.error`'d for debugging.
 */
export function toastSdkError(
  e: unknown,
  fallback: string,
  opts?: { id?: string | number }
): void {
  console.error(fallback, e)

  if (isUserRejection(e)) {
    toast.info('Signature request cancelled', opts)
    return
  }

  const msg = extractMessage(e)
  toast.error(msg ?? fallback, opts)
}

/** True when the error looks like a user-cancelled wallet prompt. */
function isUserRejection(e: unknown): boolean {
  if (!e || typeof e !== 'object') return false
  const err = e as { code?: unknown; name?: unknown; message?: unknown; cause?: unknown }
  if (err.code === 4001) return true
  if (typeof err.name === 'string' && err.name === 'UserRejectedRequestError') return true
  if (typeof err.message === 'string' && /user rejected|user denied|user cancelled/i.test(err.message)) return true
  // viem wraps EIP-1193 errors and puts the original under `.cause`.
  if (err.cause && err.cause !== e) return isUserRejection(err.cause)
  return false
}

/**
 * Best-effort extraction of a human-readable message from arbitrary error
 * shapes. Returns undefined when nothing useful is available, so the caller
 * can fall back to its action-specific string.
 */
function extractMessage(e: unknown): string | undefined {
  if (!e) return undefined
  if (typeof e === 'string') return e || undefined
  if (e instanceof ApiRequestError) {
    // ApiRequestError.message is Hyperliquid's own explanation
    // (e.g. "Order must have minimum value of $10.").
    return e.message || undefined
  }
  if (e instanceof Error) return e.message || undefined
  if (typeof e === 'object' && 'message' in e && typeof (e as { message: unknown }).message === 'string') {
    return (e as { message: string }).message || undefined
  }
  return undefined
}
