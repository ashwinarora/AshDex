import { describe, it, expect } from 'vitest'
import { isNoContact, noContactBuildEnv, siteLinks } from './siteLinks'

describe('isNoContact', () => {
  it('is on only for the exact value "true"', () => {
    expect(isNoContact('true')).toBe(true)
  })

  it('is off when unset or set to anything else', () => {
    expect(isNoContact(undefined)).toBe(false)
    expect(isNoContact('')).toBe(false)
    expect(isNoContact('false')).toBe(false)
    expect(isNoContact('TRUE')).toBe(false)
    expect(isNoContact('1')).toBe(false)
    expect(isNoContact(' true ')).toBe(false)
  })
})

describe('noContactBuildEnv', () => {
  it('links to the normal hl-tools site and leaves the sibling URLs alone in normal mode', () => {
    expect(noContactBuildEnv(undefined)).toEqual({
      NEXT_PUBLIC_NO_CONTACT: 'false',
      NEXT_PUBLIC_HLTOOLS_URL: 'https://hltools.tech'
    })
    expect(noContactBuildEnv('false')).toEqual(noContactBuildEnv(undefined))
  })

  it('links to the showcase hl-tools site in no-contact mode', () => {
    const env = noContactBuildEnv('true')
    expect(env.NEXT_PUBLIC_NO_CONTACT).toBe('true')
    expect(env.NEXT_PUBLIC_HLTOOLS_URL).toBe('https://showcase.hltools.tech')
  })

  it('blanks the sibling deployment URLs in no-contact mode', () => {
    const env = noContactBuildEnv('true')
    expect(env.NEXT_PUBLIC_MAINNET_APP_URL).toBe('')
    expect(env.NEXT_PUBLIC_TESTNET_APP_URL).toBe('')
  })

  it('never hands a normal-site URL to a no-contact build', () => {
    const values = Object.values(noContactBuildEnv('true'))
    for (const { normal } of Object.values(siteLinks)) {
      expect(values).not.toContain(normal)
    }
  })
})

describe('siteLinks', () => {
  it('pairs every normal site with its showcase deployment', () => {
    for (const { normal, showcase } of Object.values(siteLinks)) {
      expect(showcase).toBe(normal.replace('https://', 'https://showcase.'))
    }
  })
})
