const STORAGE_KEY = 'pendingWithdrawals'

export interface PendingWithdrawal {
  amount: string // Total amount withdrawn
  displayAmount: string // Amount minus fee (what user receives)
  fee: string // Always "1" USDC
  timestamp: number // When initiated
  address: string // User address (lowercase)
}

export const getPendingWithdrawals = (address: string): PendingWithdrawal[] => {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    const all: PendingWithdrawal[] = JSON.parse(stored)
    // Filter by address and remove stale entries (> 24 hours old)
    const now = Date.now()
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours
    return all.filter(
      (pw) => pw.address.toLowerCase() === address.toLowerCase() && now - pw.timestamp < maxAge
    )
  } catch {
    return []
  }
}

export const addPendingWithdrawal = (withdrawal: PendingWithdrawal): void => {
  if (typeof window === 'undefined') return
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    const all: PendingWithdrawal[] = stored ? JSON.parse(stored) : []
    all.push({
      ...withdrawal,
      address: withdrawal.address.toLowerCase()
    })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  } catch {
    // Silently fail
  }
}

export const removePendingWithdrawal = (address: string, completedTimestamp: number): void => {
  if (typeof window === 'undefined') return
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return
    const all: PendingWithdrawal[] = JSON.parse(stored)
    // Find and remove matching withdrawal by address and timestamp proximity (within 10 minutes)
    const timeWindow = 10 * 60 * 1000 // 10 minutes
    const filtered = all.filter((pw) => {
      if (pw.address.toLowerCase() !== address.toLowerCase()) return true
      // Keep if timestamp is not within window of completed timestamp
      return Math.abs(pw.timestamp - completedTimestamp) > timeWindow
    })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  } catch {
    // Silently fail
  }
}

export const clearPendingWithdrawalsForAddress = (address: string): void => {
  if (typeof window === 'undefined') return
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return
    const all: PendingWithdrawal[] = JSON.parse(stored)
    const filtered = all.filter((pw) => pw.address.toLowerCase() !== address.toLowerCase())
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  } catch {
    // Silently fail
  }
}
