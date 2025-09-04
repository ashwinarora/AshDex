import { DevTools, Tolgee, FormatSimple, BackendFetch } from '@tolgee/web'

const apiKey = process.env.NEXT_PUBLIC_TOLGEE_API_KEY
const apiUrl = process.env.NEXT_PUBLIC_TOLGEE_API_URL

export const ALL_LANGUAGES = ['en-US', 'ar-SA']

export const DEFAULT_LANGUAGE = 'en-US'

export function TolgeeBase() {
  return (
    Tolgee()
      .use(
        BackendFetch({
          prefix: 'https://cdn.tolg.ee/da5ee4daf2d82cec829b573b541906ff',
          next: {
            revalidate: 60, // cache CDN data for one minute
          },
        })
      )
      .use(FormatSimple())
      // replace with .use(FormatIcu()) for rendering plurals, foramatted numbers, etc.
      .use(DevTools())
      .updateDefaults({
        apiKey,
        apiUrl,
        staticData: {
          "en-US": () => import('../../messages/en-US.json'),
          "ar-SA": () => import('../../messages/ar-SA.json')
        }
      })
  )
}
