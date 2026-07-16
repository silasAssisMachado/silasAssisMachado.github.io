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
 * Dois formatos, porque os apps não concordam:
 *
 *   horizontal 1200x630 — o padrão OG. Grande e bonito no LinkedIn, Slack,
 *                         Telegram, Twitter.
 *   quadrado   1200x1200 — o WhatsApp só desenha o preview GRANDE quando a
 *                         imagem é quadrada; num 1.91:1 ele degrada pra
 *                         miniaturinha na lateral e o cartão vira ilegível.
 *                         (É o que o Rafael faz: og:image dele é 1254x1254.)
 *
 * Em ambos: a foto manda, o texto é o mínimo pra dizer quem é.
 */

/** Partes comuns aos dois cartões. */
const cardCss = `
  ${fonts}
  * { margin: 0; box-sizing: border-box; }
  body {
    position: relative; background: ${NIGHT}; color: #fff; overflow: hidden;
    font-family: 'Bricolage Grotesque', system-ui, sans-serif;
  }
  .media { position: absolute; inset: 0; }
  .media img { width: 100%; height: 100%; object-fit: cover; }
  /* Puxa a foto pro índigo da marca. */
  .tint { position: absolute; inset: 0; background: ${INDIGO}; mix-blend-mode: color; opacity: 0.3; }
  .loc {
    font-family: 'JetBrains Mono', monospace; letter-spacing: 0.02em; color: #b3bad2;
  }
  h1 { line-height: 1; letter-spacing: -0.035em; font-weight: 700; }
  .role { font-family: 'JetBrains Mono', monospace; letter-spacing: -0.01em; color: #b7abff; }
  .rule { height: 3px; background: ${INDIGO_BRIGHT}; border-radius: 2px; }
`

/**
 * Horizontal: a foto ocupa mais da metade e sangra pra dentro do fundo (o
 * degradê começa dentro dela, senão sobra costura na borda).
 */
const ogWide = `<!doctype html><meta charset="utf-8">
<style>
  ${cardCss}
  body { width: 1200px; height: 630px; }
  .media { inset: 0 0 0 38%; }
  .media img { object-position: 55% 18%; }
  .fade { position: absolute; inset: 0;
    background: linear-gradient(90deg, ${NIGHT} 0%, ${NIGHT} 10%,
      color-mix(in srgb, ${NIGHT}, transparent 45%) 38%, transparent 70%); }
  .copy {
    position: absolute; inset: 0 auto 0 0; width: 600px;
    padding: 64px 36px 64px 72px; display: flex; flex-direction: column;
    justify-content: center; gap: 16px;
  }
  .loc { font-size: 17px; }
  h1 { font-size: 76px; }
  .role { font-size: 21px; }
  .rule { width: 96px; }
  p { font-size: 23px; line-height: 1.4; color: #dcdff0; max-width: 22ch; text-wrap: balance; }
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

/**
 * Quadrado: a foto E SÓ. Sem texto de propósito — o WhatsApp já escreve nome e
 * descrição ao lado da imagem, e no tamanho em que ele desenha a miniatura
 * (~76px) qualquer texto embutido vira borrão. Quem tem que ler em 76px é o
 * rosto, então o corte fecha nele.
 *
 * Sem tint também: aqui a foto é um retrato, não um cartão. O índigo em cima da
 * pele deixa o rosto roxo, e um rosto tem que parecer um rosto — a marca fica
 * pro site. (O zoom para em 1.55: a origem é 1100x1760 e mais que isso amolece.)
 */
const ogSquare = `<!doctype html><meta charset="utf-8">
<style>
  ${cardCss}
  body { width: 1200px; height: 1200px; }
  .media { overflow: hidden; }
  .media img { object-position: 50% 12%; transform: scale(1.55); transform-origin: 52% 22%; }
</style>
<div class="media">
  <img src="data:image/jpeg;base64,${photo}" alt="">
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

// PNG dá ~350 KB. O WhatsApp engasga com cartão pesado (acima de ~300 KB ele às
// vezes nem busca a imagem) — então o entregável é JPEG.
async function card(html, w, h, out) {
  await shoot(html, w, h, '.og-tmp.png')
  await sharp('.og-tmp.png').jpeg({ quality: 88, progressive: true, mozjpeg: true }).toFile(out)
  rmSync('.og-tmp.png')
  console.log(`✓ ${out} (${w}×${h}, ${(readFileSync(out).length / 1024).toFixed(0)} KB)`)
}

await card(ogWide, 1200, 630, 'assets/og.jpg')
await card(ogSquare, 1200, 1200, 'assets/og-square.jpg')

await browser.close()

// Os ícones saem do próprio favicon.svg — uma fonte só pro monograma.
for (const [size, out] of [
  [180, 'assets/apple-touch-icon.png'],
  [32, 'assets/favicon-32.png'],
]) {
  await sharp(faviconSvg, { density: 384 }).resize(size, size).png().toFile(out)
  console.log(`✓ ${out} (${size}×${size})`)
}
