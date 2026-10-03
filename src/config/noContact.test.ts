import { describe, it, expect, afterEach, vi } from 'vitest'

// The module reads the values next.config.ts inlines at build time, so each case sets them
// and loads a fresh copy.
const load = async (env: Record<string, string>) => {
  vi.resetModules()
  for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value)
  return import('./noContact')
}

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('NO_CONTACT', () => {
  it('is true when the build was made with NO_CONTACT=true', async () => {
    const { NO_CONTACT } = await load({ NEXT_PUBLIC_NO_CONTACT: 'true' })
    expect(NO_CONTACT).toBe(true)
  })

  it('is false for a normal build', async () => {
    expect((await load({ NEXT_PUBLIC_NO_CONTACT: 'false' })).NO_CONTACT).toBe(false)
    expect((await load({ NEXT_PUBLIC_NO_CONTACT: '' })).NO_CONTACT).toBe(false)
    expect((await load({})).NO_CONTACT).toBe(false)
  })
})

describe('HLTOOLS_URL', () => {
  it('is the URL the build selected', async () => {
    const { HLTOOLS_URL } = await load({ NEXT_PUBLIC_HLTOOLS_URL: 'https://showcase.hltools.tech' })
    expect(HLTOOLS_URL).toBe('https://showcase.hltools.tech')
  })
})
