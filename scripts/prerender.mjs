// Вшиває готовий HTML у dist/index.html, щоб пошуковики й превʼю бачили весь текст без JavaScript.
import { readFile, writeFile, readdir, rm } from 'node:fs/promises'
import { loadEnv } from 'vite'

const { render, structuredData } = await import('../.ssr/entry-server.js')

const env = loadEnv('production', process.cwd(), '')
const host = process.env.VERCEL_PROJECT_PRODUCTION_URL
const siteUrl = (env.VITE_SITE_URL || (host ? `https://${host}` : '')).replace(/\/$/, '')

const fonts = (await readdir('dist/assets')).filter((f) =>
  /^(geologica-(cyrillic|latin)-shrp|onest-(cyrillic|latin)-wght)/.test(f),
)

const head = [
  ...fonts.map((f) => `<link rel="preload" href="/assets/${f}" as="font" type="font/woff2" crossorigin />`),
  `<meta property="og:image" content="${siteUrl}/og.png" />`,
  '<meta property="og:image:width" content="1200" />',
  '<meta property="og:image:height" content="630" />',
  siteUrl && `<link rel="canonical" href="${siteUrl}/" />`,
  siteUrl && `<meta property="og:url" content="${siteUrl}/" />`,
  `<script type="application/ld+json">${JSON.stringify(structuredData(siteUrl)).replace(/</g, '\\u003c')}</script>`,
].filter(Boolean)

const template = await readFile('dist/index.html', 'utf8')
const html = template
  .replace('<!--head-->', () => head.join('\n    '))
  .replace('<!--app-->', () => render())
await writeFile('dist/index.html', html)

await writeFile(
  'dist/robots.txt',
  `User-agent: *\nAllow: /\n${siteUrl ? `\nSitemap: ${siteUrl}/sitemap.xml\n` : ''}`,
)
if (siteUrl) {
  await writeFile(
    'dist/sitemap.xml',
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${siteUrl}/</loc><lastmod>${new Date().toISOString().slice(0, 10)}</lastmod></url>\n</urlset>\n`,
  )
} else {
  console.warn('VITE_SITE_URL не задано: canonical, og:url і sitemap.xml пропущено.')
}

await rm('.ssr', { recursive: true, force: true })
console.log(`prerender: ${(html.length / 1024).toFixed(0)} KB`)
