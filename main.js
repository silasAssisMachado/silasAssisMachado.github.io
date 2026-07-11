/* Silas Machado — portfólio
   Abas (padrão do profile shell) + i18n PT/EN + menu de CV. Sem dependências. */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var langReady = false;

  // Slide transitório: nunca prende visibilidade. Classe removida ao terminar
  // (com timeout de segurança caso a animação seja pausada/interrompida).
  function playSlide(el, dir) {
    if (!el || reduce) return;
    el.style.setProperty('--slide', (dir || 16) + 'px');
    el.classList.remove('sliding');
    void el.offsetWidth;
    el.classList.add('sliding');
    var clear = function () { el.classList.remove('sliding'); };
    el.addEventListener('animationend', clear, { once: true });
    setTimeout(clear, 520);
  }

  /* ------------------------------------------------------------- i18n */
  var EN = {
    heroAlt: 'Silas Machado, wearing glasses and a dark jacket, on a city street outdoors',
    pitch: 'I build security and compliance platforms — from architecture to continuous deployment, keeping the team informed at every decision.',
    cv: 'Download CV',
    cvLong: 'Download résumé',
    hint: 'See my work',
    tabAbout: 'About', tabCareer: 'Career', tabProjects: 'Projects', tabContact: 'Contact',

    kAbout: 'About',
    hAbout: "Technology that improves people's lives.",
    pAbout1: "I'm passionate about technology that helps people's everyday lives, and about the people who build it. As I said in my very first interview, my goal is to be part of that <strong>1% that changes the world</strong>.",
    pAbout2: 'I surface both the benefits and the challenges of every implementation, making sure the team is informed and ready to make the best decisions. What you can expect from me: <strong>proactivity, creativity, flexibility and dedication</strong>, with empathy and non-violent communication.',
    pAbout3: 'Day to day, I work side by side with Product Owners, Project Managers and engineering teams to build high-performing solutions, with open communication across every party, internal and external.',
    pAbout4: 'Across my career, I have learned as much from leading people as from writing code. I believe the team has to <strong>embrace the solution as a whole</strong>, with a strong ubuntu spirit: I am because we are. What we build, we build together.',
    skLang: 'Languages', skFront: 'Front-end', skInfra: 'Infra & DevOps', skData: 'Data, queues & auth',
    fLang: 'Spoken', fLangV: 'Portuguese (native) · English (advanced)',
    fBase: 'Based in', fBaseV: 'Porto, Portugal · available for remote',
    fEdu: 'Education', fEduV: 'Computer Science · UniCarioca (2015–2019)',
    aboutCta: "Let's talk",

    kCareer: 'Career', hCareer: 'A decade building and leading.',
    subCareer: 'From intern to Technical Lead — payments, marketplaces, games, integrations and, today, security and compliance.',
    j1Meta: 'Jun 2025 — present · Colorado, USA (remote)',
    j1Desc: 'I drive product and technical decisions across an ecosystem of six interconnected products — architecture, implementation, infrastructure and security. I standardized observability, coding standards and CI/CD on Kubernetes/Helm.',
    j2Meta: 'Feb — Jul 2025 · Porto, Portugal',
    j2Desc: 'Hired as Senior Backend (Python) and promoted to lead within the first month. I took end-to-end technical direction of the retail integration platform, introduced architecture standards, and shipped an AI-powered dynamic extractor that generates extraction code on the fly.',
    j3Meta: 'Nov 2022 — Sep 2024 · Colorado Springs, USA',
    j3Desc: 'I led integration efforts (Google Ads, Facebook Ads, databases, APIs) syncing data into a Multi-Party Computation store, and built much of an internal insights tool — auth, security layers, dashboards.',
    j4Meta: 'Jun 2020 — Dec 2023 · Rio de Janeiro, Brazil',
    j4Desc: 'I co-founded a consultancy helping small companies with IT problems. I managed a team of 8 (engineers and designers) across the whole project lifecycle, designing full ecosystems and rolling out agile workflows at clients.',
    j5Meta: 'Sep 2021 — Jun 2022 · São Paulo, Brazil',
    j5Desc: 'Platforms team: services used by the games and management tools. I improved game health reporting and inventory management, led the onboarding restructuring, and mentored junior devs.',
    j6Meta: 'Nov 2019 — Sep 2021 · Rio de Janeiro, Brazil',
    j6Desc: "Payments team, responsible for all B2C and B2B transactions: gateways, checkout, orders, installments, refunds and anti-fraud. Technical representative for the backend on the company's internal committee.",
    j7Meta: 'Jun 2016 — Nov 2019 · Rio de Janeiro, Brazil',
    j7Desc: 'From intern to developer: microservices for the book marketplace, payment and logistics integrations, and data visualization turning complex information into actionable insights.',

    kProjects: 'Projects', hProjects: "Things I've built.",
    subProjects: 'My own products first. Then a deeper look at the DataHubz security and compliance ecosystem.',
    featTagStreet: 'Platform', featTagCointabil: 'Accounting', featTagPalm: 'Product',
    featStreet: "Map-first platform to discover, map and vouch for street spots, with photo-first public profiles. It's the same browsing experience as this portfolio.",
    featCointabil: 'My own product in the accounting and finance space.',
    featPalm: 'My own product. More details soon.',
    projEcosystem: 'The DataHubz ecosystem',
    tagIdentity: 'Identity', tagSecurity: 'Security', tagCompliance: 'Compliance', tagDevsecops: 'DevSecOps', tagRetail: 'Retail · AI',
    proj1: 'Centralized SSO with passkeys/FIDO2, social login and OAuth2 PKCE, shipped as a reusable SDK consumed by every product in the ecosystem.',
    proj2: 'Privacy-preserving desktop security scanner running Semgrep, Gitleaks, Trivy, Trufflehog and more — with governance scoring and tamper-proof evidence anchored on blockchain.',
    proj3: 'Browser-native rewrite of a Google Workspace / M365-style compliance suite, with twelve integrated apps (Vault, Documents, Secrets, Projects, Evidence and others) tied to roadmap frameworks.',
    proj4: 'Compliance-native Git platform on a custom substrate, integrated with the CSE Registry (1,143+ signals), with posture scoring, gap analysis and Vericode — blockchain attestation via Groth16 ZK proofs on zkVerify.',
    proj5: 'Integration and intelligent-processing platform for retail: ingests data from multiple partners and transforms it into a common format through a pipeline orchestrated with Azure Event Grid and Functions, with an AI-generated sanitizing extractor.',

    kContact: 'Contact', hContact: "Let's build something.",
    contactLead: 'Open to good conversations about hiring, partnership or a project.',
    cEmail: 'Email', cPhone: 'Phone',
    foot: 'Made with coffee and continuous deployment ☕'
  };

  var textEls = Array.prototype.slice.call(document.querySelectorAll('[data-i18n]'));
  var htmlEls = Array.prototype.slice.call(document.querySelectorAll('[data-i18n-html]'));
  // Guarda o PT original do DOM para poder voltar.
  var PT = {};
  textEls.forEach(function (el) {
    var k = el.getAttribute('data-i18n');
    var attr = el.getAttribute('data-i18n-attr');
    PT[k] = attr ? el.getAttribute(attr) : el.textContent.trim();
  });
  htmlEls.forEach(function (el) { PT[el.getAttribute('data-i18n-html')] = el.innerHTML.trim(); });

  var langButtons = Array.prototype.slice.call(document.querySelectorAll('.lang__opt'));

  function setLang(lang) {
    var dict = lang === 'en' ? EN : PT;
    textEls.forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      if (dict[k] == null) return;
      var attr = el.getAttribute('data-i18n-attr');
      if (attr) el.setAttribute(attr, dict[k]);
      else el.textContent = dict[k];
    });
    htmlEls.forEach(function (el) {
      var k = el.getAttribute('data-i18n-html');
      if (dict[k] != null) el.innerHTML = dict[k];
    });
    document.documentElement.lang = lang === 'en' ? 'en' : 'pt-BR';
    langButtons.forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-lang') === lang ? 'true' : 'false');
    });
    // Troca de idioma também desliza o conteúdo ativo.
    if (langReady) playSlide(document.querySelector('.panel[data-active]'), 16);
  }

  langButtons.forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); });
  });

  // Default sempre EN a cada carregamento (o toggle troca ao vivo, sem persistir).
  setLang('en');
  langReady = true;

  /* ------------------------------------------------------------- abas */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));
  var panelsById = {};
  tabs.forEach(function (t) { panelsById[t.getAttribute('aria-controls')] = document.getElementById(t.getAttribute('aria-controls')); });
  var order = tabs.map(function (t) { return t.getAttribute('aria-controls'); });

  function currentId() {
    var sel = document.querySelector('.tab[aria-selected="true"]');
    return sel ? sel.getAttribute('aria-controls') : order[0];
  }

  function activate(id) {
    if (!panelsById[id]) return;
    var dir = order.indexOf(id) >= order.indexOf(currentId()) ? 18 : -18;
    tabs.forEach(function (t) { t.setAttribute('aria-selected', t.getAttribute('aria-controls') === id ? 'true' : 'false'); });
    order.forEach(function (pid) {
      var p = panelsById[pid];
      if (pid === id) {
        p.hidden = false;
        p.setAttribute('data-active', '');
        playSlide(p, dir);
      } else {
        p.hidden = true;
        p.removeAttribute('data-active');
      }
    });
    var panels = document.querySelector('.panels');
    if (panels && window.matchMedia('(min-width: 1024px)').matches) panels.scrollTop = 0;
    if (history.replaceState) history.replaceState(null, '', '#' + id);
  }

  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { activate(t.getAttribute('aria-controls')); });
    t.addEventListener('keydown', function (e) {
      var next;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % tabs.length;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = tabs.length - 1;
      else return;
      e.preventDefault();
      tabs[next].focus();
      activate(tabs[next].getAttribute('aria-controls'));
    });
  });

  var hash = (location.hash || '').replace('#', '');
  if (hash && panelsById[hash]) activate(hash);

  /* --------------------------------------------------- dica de scroll */
  var hint = document.querySelector('[data-scrollto]');
  if (hint) {
    hint.addEventListener('click', function (e) {
      e.preventDefault();
      activate('about');
      var content = document.getElementById('content');
      if (content) content.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    });
  }

  /* ------------------------------------- CTA interno: pula pra outra aba */
  document.querySelectorAll('[data-goto]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      var target = el.getAttribute('data-goto');
      activate(target);
      var tabBtn = document.getElementById('tab-' + target);
      if (tabBtn) tabBtn.focus({ preventScroll: true });
      var content = document.getElementById('content');
      if (content && !window.matchMedia('(min-width: 1024px)').matches) {
        content.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      }
    });
  });

  /* --------------------------------------- menu CV: fecha ao clicar fora */
  document.addEventListener('click', function (e) {
    document.querySelectorAll('.cvmenu[open]').forEach(function (d) {
      if (!d.contains(e.target)) d.removeAttribute('open');
    });
  });
})();
