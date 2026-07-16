---
name: Silas Machado — Portfólio
description: Portfólio pessoal photo-first, herdando a navegação do perfil público do StreetSlopes. Marca em indigo elétrico do CV.
colors:
  bg: "oklch(0.992 0.003 271)"
  surface: "oklch(1 0 0)"
  tint: "oklch(0.958 0.017 271)"
  tint-2: "oklch(0.928 0.028 271)"
  ink: "oklch(0.235 0.02 271)"
  ink-2: "oklch(0.44 0.026 271)"
  ink-3: "oklch(0.545 0.022 271)"
  line: "oklch(0.905 0.011 271)"
  indigo: "oklch(0.50 0.245 271)"
  indigo-bright: "oklch(0.585 0.225 270)"
  indigo-deep: "oklch(0.405 0.205 271)"
  night: "oklch(0.165 0.03 272)"
typography:
  display:
    fontFamily: "'Bricolage Grotesque', system-ui, sans-serif"
    fontSize: "clamp(2.6rem, 12vw, 4rem)"
    fontWeight: 800
    lineHeight: 0.98
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "'Bricolage Grotesque', system-ui, sans-serif"
    fontSize: "clamp(1.7rem, 5.5vw, 2.5rem)"
    fontWeight: 800
    letterSpacing: "-0.03em"
  body:
    fontFamily: "'Bricolage Grotesque', system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 420
    lineHeight: 1.65
  mono:
    fontFamily: "'JetBrains Mono', ui-monospace, monospace"
    fontSize: "0.8rem"
    fontWeight: 500
  label:
    fontFamily: "'JetBrains Mono', ui-monospace, monospace"
    fontSize: "0.72rem"
    fontWeight: 600
    letterSpacing: "0.15em"
    textTransform: "uppercase"
rounded:
  sm: "8px"
  md: "10px"
  lg: "14px"
  full: "9999px"
spacing:
  gutter: "clamp(1.25rem, 5vw, 3rem)"
---

# Design System: Silas Machado — Portfólio

## 1. Overview

**North star: "É um perfil, não um panfleto."** O site herda a experiência de
navegação photo-first do perfil público do StreetSlopes (ADR-0018): uma foto
full-bleed carrega a identidade e o conteúdo desce numa coluna única, com a
barra de seções acendendo sozinha conforme a leitura avança. No mobile a foto
ocupa a tela toda e o conteúdo entra por snap-scroll; no desktop vira um split
foto-esquerda / conteúdo-direita. A foto é o produto.

A marca é o **indigo elétrico** herdado do CV do Silas — uma escolha de
identidade, não uma decisão nova. Estratégia de cor **comprometida**: o indigo
carrega ação e ênfase (botões, links, dots da timeline, labels), sobre uma
superfície off-white com um fio quase imperceptível do mesmo hue (nada de
creme). A hero é escura por natureza — foto sob gradiente preto — e o conteúdo
é claro e escaneável.

## 2. Colors

Base off-white levemente puxada ao indigo (`--bg`), tinta de texto escura de
alto contraste (`--ink` em corpo, `--ink-2` para secundário — ambos ≥ 4.5:1).
O indigo (`--indigo`, oklch 0.50 0.245 271) é a única cor saturada e aparece
com parcimônia: CTA, links, `--indigo-deep` em tags. `--night` cobre hero e
rodapé mobile. Sem gradientes de texto, sem stripes laterais.

## 3. Typography

Uma família distinta faz todo o trabalho de texto — **Bricolage Grotesque**
(400–800), fora da lista de fontes-reflexo — pareada com **JetBrains Mono**
para labels técnicos, metadados, tags de stack e o eyebrow das seções. O mono
é justificado: o assunto é engenharia de software. Display em 800 com tracking
apertado (−0.035em); corpo em 420 a 1.65 de entrelinha, ≤ 68ch.

## 4. Layout

- **Shell**: mobile = documento com snap suave (hero 100dvh → conteúdo); desktop
  ≥1024px = grid 40/60 (36/64 em ≥1280px), foto fixa à esquerda com borda que
  desvanece para o conteúdo.
- **Seções** (Sobre → Trajetória → Projetos → Contato, nesta ordem): as quatro
  vivem na mesma coluna e rolam juntas, separadas por um fio. A nav sticky no
  topo do conteúdo é scroll-spy — pílula em tinta escura acende a seção que
  está sendo lida, e clicar rola até ela. Não são abas: navegar é rolar, e a
  ordem do documento é a ordem da barra. Contato fecha a página porque é a
  ação que ela pede.
- **Trajetória**: timeline real (a ordem carrega informação) com trilho e dots
  indigo — não cards idênticos.
- **Projetos**: lista de produtos do ecossistema DataHubz, cada um com tag e
  stack; cards só onde são o affordance certo, nunca aninhados.

## 5. Motion

Entrada da hero em stagger (aprimora um default já visível, não bloqueia
conteúdo), leve ken-burns na foto, dica de scroll com nudge, e slide na troca de
idioma. A troca de seção não anima: a animação é a própria rolagem.
Curvas ease-out (cubic-bezier(0.22,1,0.36,1)), sem bounce.
Tudo com alternativa em `prefers-reduced-motion: reduce`.

## 6. Assets

- `assets/silas.jpg` — retrato em alta resolução (foto-herói), recorte rosto+torso.
- `assets/Silas-Machado-CV-PT-2026.pdf` / `-EN-2026.pdf` — CV nas duas línguas,
  baixáveis pelo menu (path relativo, servido direto pelo GitHub Pages).
- `assets/fonts.css` — Bricolage Grotesque + JetBrains Mono embutidas em base64
  (self-contained, sem dependência de CDN).
- `assets/favicon.svg` — monograma "S" em indigo.
