/**
 * No-contact mode: the one place the app learns about it.
 *
 * `NO_CONTACT=true` in the build environment produces a deployment that gives a visitor no
 * way to reach me and no link to any of my normal sites. Unset, or any other value, is the
 * normal site. `next.config.ts` turns that one variable into the values below at build
 * time, so anything gated on `NO_CONTACT` is removed from the output rather than hidden.
 *
 * Gate contact UI with `NO_CONTACT` and take links to my other sites from here. Never
 * hard-code either elsewhere. See README "No-contact mode".
 */
export const NO_CONTACT = process.env.NEXT_PUBLIC_NO_CONTACT === 'true'

/** hl-tools, on the deployment that matches this one (see `siteLinks.ts`). */
export const HLTOOLS_URL = process.env.NEXT_PUBLIC_HLTOOLS_URL as string
