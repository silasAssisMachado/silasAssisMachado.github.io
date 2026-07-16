/**
 * Gera os arquivos de compartilhamento e de aba:
 *
 *   assets/og.jpg             1200×630 — o cartão que aparece no WhatsApp/LinkedIn/Slack
 *   assets/favicon-32.png     fallback pra quem não lê SVG
 *   assets/apple-touch-icon.png  180×180 — atalho na tela inicial do iPhone (iOS ignora SVG)
 *
 *   npm run social
 *
 * Renderiza com o mesmo Chrome headless dos screenshots, usando a foto e as
 * fontes reais do site — o cartão é a marca, não um genérico.
 */
import { readFileSync, readdirSync, existsSync, rmSync } from 'node:fs'
import { execSync } from 'node:child_process'
import puppeteer from 'puppeteer-core'
import sharp from 'sharp'

const cacheDir = `${process.env.HOME}/.cache/puppeteer/chrome-headless-shell`
const version = readdirSync(cacheDir).sort().pop()
const executablePath = `${cacheDir}/${version}/chrome-headless-shell-linux64/chrome-headless-shell`
if (!existsSync(executablePath)) throw new Error('chrome-headless-shell ausente')

// O chrome-headless-shell precisa de libasound.so.2, que não vem no WSL limpo.
// Ver docs/BUILD-TOOLKIT.md no repo da Aline: extrair o .deb sem sudo.
const libDir = execSync(
  'find /tmp/claude-* -maxdepth 10 -type d -path "*chrome/libs/usr/lib/x86_64-linux-gnu" 2>/dev/null | head -1',
  { shell: '/bin/bash' },
)
  .toString()
  .trim()
if (libDir) process.env.LD_LIBRARY_PATH = [libDir, process.env.LD_LIBRARY_PATH].filter(Boolean).join(':')

const fonts = readFileSync('assets/fonts.css', 'utf8')
const photo = readFileSync('assets/silas.jpg').toString('base64')
const faviconSvg = readFileSync('assets/favicon.svg')

// Os mesmos tokens do styles.css.
const NIGHT = 'oklch(0.165 0.03 272)'
const INDIGO = 'oklch(0.50 0.245 271)'
const INDIGO_BRIGHT = 'oklch(0.585 0.225 270)'

/**
 * O cartão: o azul-noite do site, a foto sangrando à direita e derretendo no
 * fundo, nome grande e a linha que diz o que eu faço. Em inglês porque o site
 * abre em inglês.
 */
const ogHtml = `<!doctype html><meta charset="utf-8">
<style>
  ${fonts}
  * { margin: 0; box-sizing: border-box; }
  body {
    width: 1200px; height: 630px; position: relative;
    background: ${NIGHT}; color: #fff; overflow: hidden;
    font-family: 'Bricolage Grotesque', system-ui, sans-serif;
  }
  /* A foto sangra pra dentro do fundo em vez de encostar numa coluna: assim o
     degradê começa dentro dela e não sobra costura na borda. */
  .media { position: absolute; inset: 0 0 0 42%; }
  .media img { width: 100%; height: 100%; object-fit: cover; object-position: 55% 20%; }
  /* Puxa a foto pro índigo da marca e derrete a borda esquerda no fundo. */
  .tint { position: absolute; inset: 0; background: ${INDIGO}; mix-blend-mode: color; opacity: 0.34; }
  .fade { position: absolute; inset: 0;
    background: linear-gradient(90deg, ${NIGHT} 0%, ${NIGHT} 14%,
      color-mix(in srgb, ${NIGHT}, transparent 40%) 40%, transparent 72%); }
  .copy {
    position: absolute; inset: 0 auto 0 0; width: 620px;
    padding: 64px 40px 64px 72px; display: flex; flex-direction: column;
    justify-content: center; gap: 16px;
  }
  .loc {
    font-family: 'JetBrains Mono', monospace; font-size: 17px; letter-spacing: 0.02em;
    color: #a5aec9;
  }
  h1 { font-size: 74px; line-height: 1; letter-spacing: -0.035em; font-weight: 700; }
  .role {
    font-family: 'JetBrains Mono', monospace; font-size: 21px; letter-spacing: -0.01em;
    color: #a99cff;
  }
  .rule { width: 96px; height: 3px; background: ${INDIGO_BRIGHT}; border-radius: 2px; }
  p { font-size: 24px; line-height: 1.4; color: #dcdff0; max-width: 21ch; text-wrap: balance; }
</style>
<div class="media">
  <img src="data:image/jpeg;base64,${photo}" alt="">
  <div class="tint"></div>
  <div class="fade"></div>
</div>
<div class="copy">
  <span class="loc">Vila Nova de Gaia · Porto, Portugal</span>
  <h1>Silas Machado</h1>
  <span class="role">Technical Lead · Software Engineer</span>
  <div class="rule"></div>
  <p>Security and compliance platforms, from architecture to continuous deploy.</p>
</div>`

const browser = await puppeteer.launch({
  executablePath,
  args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars'],
})

async function shoot(html, width, height, out) {
  const page = await browser.newPage()
  await page.setViewport({ width, height, deviceScaleFactor: 1 })
  await page.setContent(html, { waitUntil: 'networkidle0' })
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: out })
  await page.close()
}

// PNG de 1200×630 dá ~350 KB. O WhatsApp engasga com cartão pesado (acima de
// ~300 KB ele às vezes nem busca a imagem) — então o entregável é JPEG.
await shoot(ogHtml, 1200, 630, '.og-tmp.png')
await sharp('.og-tmp.png').jpeg({ quality: 88, progressive: true, mozjpeg: true }).toFile('assets/og.jpg')
rmSync('.og-tmp.png')
console.log(`✓ assets/og.jpg (1200×630, ${(readFileSync('assets/og.jpg').length / 1024).toFixed(0)} KB)`)

await browser.close()

// Os ícones saem do próprio favicon.svg — uma fonte só pro monograma.
for (const [size, out] of [
  [180, 'assets/apple-touch-icon.png'],
  [32, 'assets/favicon-32.png'],
]) {
  await sharp(faviconSvg, { density: 384 }).resize(size, size).png().toFile(out)
  console.log(`✓ ${out} (${size}×${size})`)
}
