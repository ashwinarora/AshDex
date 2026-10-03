// Builds the app with NO_CONTACT=true and fails if anything a visitor can receive leads to
// me. Run it with `bun run check:no-contact`. See README "No-contact mode".
//
// For each network (mainnet, then testnet, because the faucet promo only exists on testnet)
// it builds, then scans:
//   - every text file under .next/static and public (the JS, CSS and assets a browser loads),
//     and the names of all files there,
//   - everything Next prerendered under .next/server/app (HTML, RSC payloads, headers),
//   - the live responses of `next start` for every route in the build, as HTML and as RSC,
//     including the on-demand routes and a 404.
// Files are scanned whole, so a link hidden with CSS or left behind a runtime check fails.
//
//   --no-build        scan the build already in .next instead of building both networks
//   --port <number>   port for `next start` (default: a free one picked by the OS)
//
// The build goes to .next, so do not run this while `bun dev` is running.
import { execFileSync, spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { readdir, readFile } from 'node:fs/promises'
import { createServer } from 'node:net'
import { join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repo = resolve(fileURLToPath(new URL('..', import.meta.url)))
const dist = join(repo, '.next')
const nextBin = join(repo, 'node_modules', 'next', 'dist', 'bin', 'next')

const args = process.argv.slice(2)
const skipBuild = args.includes('--no-build')
const portArg = args.includes('--port') ? Number(args[args.indexOf('--port') + 1]) : undefined

// A normal-deployment domain of any of my sites is forbidden; its `showcase.` deployment is
// the no-contact one and is allowed. "showcase.ashdex.app" contains "ashdex.app", so the
// pattern excludes that prefix, and "testnet.ashdex.app" (a normal site) still matches.
const NORMAL_DOMAINS = [
  'ashwinarora.com',
  'ashdex.app',
  'lizardpoisonspock.com',
  'hltools.tech',
  'ethtactoe.com',
  'socialnetwrk.in',
  'ethhousie.com'
]

const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const FORBIDDEN = [
  { name: 'email address', pattern: /[a-z0-9._%+-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}/gi },
  { name: 'mailto:', pattern: /mailto:/gi },
  { name: 'tel:', pattern: /\btel:\+?\d/gi },
  { name: 'calendly', pattern: /calendly/gi },
  { name: 't.me link', pattern: /(?<![a-z0-9.-])t\.me\//gi },
  { name: 'wa.me link', pattern: /(?<![a-z0-9.-])wa\.me\//gi },
  { name: 'telegram', pattern: /telegram/gi },
  { name: 'whatsapp', pattern: /whatsapp/gi },
  { name: 'linkedin', pattern: /linkedin/gi },
  { name: 'x.com / twitter.com', pattern: /(?<![a-z0-9.-])(?:x|twitter)\.com(?![a-z0-9-])/gi },
  { name: 'twitter:creator / twitter:site', pattern: /twitter:(?:creator|site)/gi },
  { name: 'github.com/ashwinarora', pattern: /github\.com\/ashwinarora/gi },
  { name: 'discord', pattern: /discord/gi },
  ...NORMAL_DOMAINS.map((domain) => ({
    name: `normal domain ${domain}`,
    pattern: new RegExp(`(?<!showcase\\.)(?<![a-z0-9-])${escape(domain)}`, 'gi')
  }))
]

// Third-party text that trips a pattern and does not lead to me. Every entry is a hole in the
// check, so keep each one this narrow: the finding it excuses, the files it may be in, and
// the exact vendor text the match has to sit inside (`text`). A match anywhere else in the
// same file still fails. All of these ship in the normal build too.
const VENDOR_CHUNK = /^\.next\/static\/chunks\/[^/]+\.js$/ // never chunks/app/**, the route code
const ALLOWED = [
  // Next.js runtime: its list of link-preview crawlers (user-agent names).
  {
    what: ['linkedin', 'discord', 'whatsapp'],
    file: /^\.next\/static\/chunks\/(?:main|\d+)-[0-9a-f]+\.js$/,
    text: /Twitterbot\|LinkedInBot\|Slackbot\|Discordbot\|WhatsApp\|SkypeUriPreview/g
  },
  // ua-parser-js inside @base-org/account (Coinbase connector): detects LinkedIn's in-app browser.
  { what: ['linkedin'], file: VENDOR_CHUNK, text: /\/\\\\\[\(linkedin\)app\\\\\]\/i/g },
  // @lifi/sdk error message shown when a bridge route fails: LI.FI's support, not mine, no link.
  {
    what: ['discord'],
    file: VENDOR_CHUNK,
    text: /Please seek assistance in the LI\.FI discord server\./g
  },
  // Stencil runtime inside @metamask/sdk-install-modal-web: a console error for component authors.
  {
    what: ['discord'],
    file: VENDOR_CHUNK,
    text: /report this on the Stencil Discord server \(https:\/\/chat\.stenciljs\.com\)/g
  },
  // @safe-global/safe-gateway-typescript-sdk (wagmi `safe` connector): enum of a Safe App's socials.
  {
    what: ['discord', 'telegram'],
    file: VENDOR_CHUNK,
    text: /\w+\.TWITTER="TWITTER",\w+\.GITHUB="GITHUB",\w+\.DISCORD="DISCORD",\w+\.TELEGRAM="TELEGRAM"/g
  },
  // Reown AppKit (the WalletConnect modal): its icon registry, keyed by icon name.
  {
    what: ['discord', 'telegram'],
    file: VENDOR_CHUNK,
    text: /\bcursor:(?:""|\w+),discord:(?:""|\w+),ethereum:|\bsolana:(?:""|\w+),telegram:(?:""|\w+),twitch:/g
  },
  // Reown AppKit: provider names for its social sign-in, which this app does not enable.
  {
    what: ['discord'],
    file: VENDOR_CHUNK,
    text: /socials:\["google","x","discord","farcaster","github","apple","facebook"\]|DEFAULT_SOCIALS:\["google","x","farcaster","discord","apple","github","facebook"\]|socialProvider:\w+\}\)=>\w+\?\w+&&"discord"===\w+&&/g
  },
  // Reown AppKit: detects that the page is open inside Telegram's in-app browser.
  {
    what: ['telegram'],
    file: VENDOR_CHUNK,
    text: /\b(?:isTelegram|loadingTelegram|(?:get|set|remove)TelegramSocialProvider|formatTelegramSocialLoginUrl|TELEGRAM_SOCIAL_PROVIDER|window\.Telegram(?:WebviewProxy(?:Proto)?)?)\b|console\.info\("Unable to (?:get|set|remove) telegram social provider"\)/g
  }
]

// Values for the dynamic route segments, so the on-demand routes can be requested. A new
// dynamic segment has to be added here; the check fails rather than skip a route.
const ROUTE_PARAMS = { asset: 'BTC', outcomeId: '1210', side: 'yes' }
const MISSING_PAGE = '/no-contact-check/missing/page'

const findings = []
let scanned = 0
let allowed = 0

/** True when the match lies inside one of the vendor texts allowed for this file. */
function isAllowed(what, file, text, hit) {
  const end = hit.index + hit[0].length
  return ALLOWED.some(
    (entry) =>
      entry.what.includes(what) &&
      entry.file.test(file) &&
      [...text.matchAll(entry.text)].some(
        (vendor) => vendor.index <= hit.index && end <= vendor.index + vendor[0].length
      )
  )
}

/** `file` is the path inside the repo when the text is a file, so allowlist entries can name it. */
function scan(source, text, file = '') {
  for (const { name, pattern } of FORBIDDEN) {
    for (const hit of text.matchAll(pattern)) {
      if (isAllowed(name, file, text, hit)) {
        allowed += 1
        continue
      }
      const context = text
        .slice(Math.max(0, hit.index - 60), hit.index + hit[0].length + 60)
        .replace(/\s+/g, ' ')
      findings.push({ source, what: name, match: hit[0], context })
    }
  }
}

const hasNoindexMeta = (html) => /<meta\s+name="robots"\s+content="[^"]*noindex/i.test(html)

async function walk(dir) {
  if (!existsSync(dir)) return []
  const entries = await readdir(dir, { withFileTypes: true })
  const files = await Promise.all(
    entries.map((entry) =>
      entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)]
    )
  )
  return files.flat()
}

/** Fonts and images are skipped by content, not by extension, so no text file is missed. */
const isBinary = (buffer) => buffer.subarray(0, 8192).includes(0)

async function scanFiles(label, dir, keep = () => true) {
  for (const file of await walk(dir)) {
    const name = relative(repo, file)
    if (!keep(name)) continue
    scanned += 1
    scan(`${label}: file name`, name)
    const buffer = await readFile(file)
    if (isBinary(buffer)) continue
    const text = buffer.toString('utf8')
    scan(`${label}: ${name}`, text, name)
    if (name.endsWith('.html') && !hasNoindexMeta(text)) {
      findings.push({
        source: `${label}: ${name}`,
        what: 'missing noindex',
        match: '<meta name="robots">'
      })
    }
  }
}

/** Resolves to a port nothing is listening on: the one asked for, or one the OS picks. */
const freePort = (wanted = 0) =>
  new Promise((done, fail) => {
    const server = createServer()
    server.once('error', () => fail(new Error(`Port ${wanted} is in use. Pass another --port.`)))
    server.listen(wanted, '127.0.0.1', () => {
      const { port } = server.address()
      server.close(() => done(port))
    })
  })

/** Every route in the build, with dynamic segments filled in from ROUTE_PARAMS. */
async function routes() {
  const manifest = JSON.parse(await readFile(join(dist, 'app-path-routes-manifest.json'), 'utf8'))
  const paths = new Set([MISSING_PAGE])
  for (const route of Object.values(manifest)) {
    const path = route.replace(/\[([^\]]+)\]/g, (segment, param) => {
      if (!(param in ROUTE_PARAMS)) {
        findings.push({
          source: route,
          what: 'route not checked',
          match: `add "${param}" to ROUTE_PARAMS`
        })
        return segment
      }
      return ROUTE_PARAMS[param]
    })
    if (!path.includes('[') && path !== '/_not-found') paths.add(path)
  }
  return [...paths].sort()
}

async function scanServer(network) {
  const port = await freePort(portArg)
  const origin = `http://127.0.0.1:${port}`
  const server = spawn(
    process.execPath,
    [nextBin, 'start', '-p', String(port), '-H', '127.0.0.1'],
    {
      cwd: repo,
      env: { ...process.env, NO_CONTACT: 'true', NEXT_TELEMETRY_DISABLED: '1' },
      stdio: ['ignore', 'ignore', 'pipe']
    }
  )
  let exited = false
  let errors = ''
  server.stderr.on('data', (chunk) => (errors += chunk))
  server.once('exit', () => (exited = true))

  try {
    for (let attempt = 0; ; attempt += 1) {
      if (exited) throw new Error(`next start exited before listening on port ${port}\n${errors}`)
      if (attempt > 240) throw new Error(`next start did not answer on port ${port}\n${errors}`)
      const up = await fetch(origin + MISSING_PAGE).then(
        () => true,
        () => false
      )
      if (up) break
      await new Promise((wait) => setTimeout(wait, 250))
    }

    for (const path of await routes()) {
      for (const rsc of [false, true]) {
        const source = `${network} server: ${rsc ? 'RSC ' : ''}${path}`
        const response = await fetch(origin + path, {
          headers: rsc ? { RSC: '1' } : {},
          redirect: 'manual'
        })
        const headers = [...response.headers].map(([key, value]) => `${key}: ${value}`).join('\n')
        const type = response.headers.get('content-type') ?? ''
        const expected = path === MISSING_PAGE ? 404 : 200
        if (response.status !== expected) {
          findings.push({ source, what: 'unexpected status', match: String(response.status) })
        }
        if (!/noindex/i.test(response.headers.get('x-robots-tag') ?? '')) {
          findings.push({ source, what: 'missing noindex', match: 'X-Robots-Tag header' })
        }
        scanned += 1
        scan(`${source} (headers)`, headers)
        if (!/^(text\/|application\/(json|javascript|xml)|image\/svg)/.test(type)) continue
        const body = await response.text()
        scan(source, body)
        if (type.startsWith('text/html') && !hasNoindexMeta(body)) {
          findings.push({ source, what: 'missing noindex', match: '<meta name="robots">' })
        }
      }
    }
  } finally {
    if (!exited) {
      server.kill()
      await new Promise((done) => server.once('exit', done))
    }
  }
}

async function check(network) {
  if (!skipBuild) {
    console.log(`\ncheck:no-contact: building with NO_CONTACT=true on ${network}\n`)
    execFileSync(process.execPath, [nextBin, 'build'], {
      cwd: repo,
      stdio: 'inherit',
      env: {
        ...process.env,
        NO_CONTACT: 'true',
        NEXT_TELEMETRY_DISABLED: '1',
        NEXT_PUBLIC_HYPERLIQUID_NETWORK: network,
        // Set on purpose. A no-contact environment is created by copying production's
        // variables, so the build must drop these even when they are present.
        NEXT_PUBLIC_MAINNET_APP_URL: 'https://ashdex.app',
        NEXT_PUBLIC_TESTNET_APP_URL: 'https://testnet.ashdex.app',
        // Public placeholders, used only when the real values are not in the environment.
        NEXT_PUBLIC_WALLET_CONNECT_ID: process.env.NEXT_PUBLIC_WALLET_CONNECT_ID || '0'.repeat(32),
        NEXT_PUBLIC_BUILDER_RECEIVER_ADDRESS:
          process.env.NEXT_PUBLIC_BUILDER_RECEIVER_ADDRESS || `0x${'0'.repeat(39)}1`
      }
    })
  }
  if (!existsSync(join(dist, 'BUILD_ID')))
    throw new Error('No build in .next. Run without --no-build.')

  await scanFiles(network, join(dist, 'static'))
  await scanFiles(network, join(repo, 'public'))
  await scanFiles(network, join(dist, 'server', 'app'), (name) =>
    /\.(html|rsc|meta|body)$/.test(name)
  )
  await scanServer(network)
}

for (const network of skipBuild ? ['existing build'] : ['mainnet', 'testnet']) await check(network)

if (findings.length > 0) {
  console.error(`\ncheck:no-contact FAILED — ${findings.length} finding(s)\n`)
  for (const finding of findings) {
    console.error(`  ${finding.source}: ${finding.what}: ${JSON.stringify(finding.match)}`)
    if (finding.context) console.error(`      …${finding.context}…`)
  }
  console.error(
    '\nGate the UI on NO_CONTACT (src/config/noContact.ts) and keep links to my other sites in src/config/siteLinks.ts.'
  )
  process.exit(1)
}

console.log(
  `\ncheck:no-contact passed — ${scanned} files and responses scanned, ${allowed} third-party matches allowed (see ALLOWED)`
)
