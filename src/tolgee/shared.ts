import { DevTools, Tolgee, FormatSimple } from '@tolgee/web'

const apiKey = process.env.NEXT_PUBLIC_TOLGEE_API_KEY
const apiUrl = process.env.NEXT_PUBLIC_TOLGEE_API_URL

export const ALL_LANGUAGES = ['en', 'ar']

export const DEFAULT_LANGUAGE = 'en'

export function TolgeeBase() {
  return (
    Tolgee()
      .use(FormatSimple())
      // replace with .use(FormatIcu()) for rendering plurals, foramatted numbers, etc.
      .use(DevTools())
      .updateDefaults({
        apiKey,
        apiUrl,
        staticData: {
          en: () => import('../../messages/en.json'),
          ar: () => import('../../messages/ar.json')
        }
      })
  )
}
