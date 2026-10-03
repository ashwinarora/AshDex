This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## No-contact mode

This repo builds two kinds of deployment from the same branch. The only difference between them is one environment variable:

| `NO_CONTACT`                  | Deployment                         | Result                                                                                     |
| ----------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------ |
| unset, or anything but `true` | `ashdex.app`, `testnet.ashdex.app` | The normal site                                                                            |
| `true`                        | `showcase.ashdex.app`              | Identical, except a visitor has no way to contact me and no link to any of my normal sites |

In no-contact mode:

- the hl-tools promo in the testnet faucet dialog links to `https://showcase.hltools.tech` instead of `https://hltools.tech`;
- the header network switch is not rendered, because the other network's deployment is a normal site. `NEXT_PUBLIC_MAINNET_APP_URL` and `NEXT_PUBLIC_TESTNET_APP_URL` are ignored even when they are set;
- every response is `noindex` (the robots meta tag, plus an `X-Robots-Tag` header).

The footer credit "Built with ♥ by Ashwin Arora" stays in both modes: it is a name with no link. All of it is decided at build time, so the normal URLs are absent from the HTML and the JavaScript rather than hidden.

### Where it lives

| File                           | Role                                                                                                                                                        |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/config/noContact.ts`      | **The flag.** Exports `NO_CONTACT` and the links to my other sites (`HLTOOLS_URL`). The only place the app learns which deployment it is                    |
| `src/config/siteLinks.ts`      | Both URL sets (normal and showcase) for every link to another of my sites, and `noContactBuildEnv`, which selects one. Nothing in the app imports this file |
| `next.config.ts`               | Reads `NO_CONTACT`, injects the selected values as build-time constants (`env`), blanks the sibling deployment URLs and adds the `X-Robots-Tag` header      |
| `scripts/check-no-contact.mjs` | `bun run check:no-contact`                                                                                                                                  |

### Rules for future changes

1. **Gate anything that leads to me on `NO_CONTACT`, in the JSX**: `{!NO_CONTACT && <NetworkSwitchButton />}`. That covers an email address, a social or GitHub link, a feedback form, a chat widget, a calendar link and "hire me" copy. `NO_CONTACT` is a build-time constant, so the bundler deletes the whole branch; the check tells you if it did not.
2. **Never hard-code a link to another of my sites, or to this site's other deployments.** Add both URLs to `src/config/siteLinks.ts`, select one in `noContactBuildEnv`, and export it from `src/config/noContact.ts`. A URL picked at run time from an object that holds both would still ship both, which is why the selection happens in `next.config.ts`.
3. **Do not add a second variable.** Everything is derived from `NO_CONTACT`. A no-contact environment is created by copying the production variables, so a variable that points at a normal site has to be blanked in `noContactBuildEnv`, as the two `NEXT_PUBLIC_*_APP_URL` variables are.
4. **Copy that invites contact needs a second wording** that reads complete without it: `NO_CONTACT ? '…' : '…'`.
5. **Images are yours to check.** The script reads text, not pixels. `src/app/opengraph-image.tsx` and any new screenshot must not show a link, a handle or an address.
6. **Run `bun run check:no-contact` before pushing.** It builds with `NO_CONTACT=true` twice (mainnet, then testnet for the faucet promo), scans `.next/static`, `public` and the prerendered pages, then starts `next start` and scans every route as HTML and as RSC. It fails on email addresses, `mailto:`, `tel:`, Calendly, Telegram, WhatsApp, LinkedIn, X/Twitter, Discord, my GitHub, the normal domains of my sites (a `showcase.` prefix is allowed) and a missing `noindex`. There is no CI in this repo, so this is the check. It builds into `.next`, so stop `bun dev` first.
7. **Keep the allowlist narrow.** The wallet and bridge libraries ship strings such as "discord" and "telegram". Each `ALLOWED` entry in the script names one finding, the vendor chunks it may be in and the exact vendor text the match must sit inside, with the reason. Never allow a whole file, and never allow anything under `chunks/app/`.

### Deploying it

Set `NO_CONTACT=true` on the service and deploy the default branch. Nothing else is required. The value is read when the app is built, so changing it needs a new build, not a restart.
