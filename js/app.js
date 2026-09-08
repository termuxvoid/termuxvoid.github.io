/* ============================================
   TermuxVoid - Main Application (Live Registry)
   ============================================ */

const App = (() => {
  let allPackages = [];
  const PREVIEW = 24;

  async function init() {
    setupMenuToggle();
    setupScrollChrome();
    await loadPackages();
  }

  /* --- Packages Loading --- */
  async function loadPackages() {
    const container = document.getElementById('toolsGrid');
    container.innerHTML = `
      <div class="loader loader--full">
        <div class="loader__spinner"></div>
        <span>reading repository index<span class="loader__cursor"></span></span>
      </div>
    `;

    try {
      allPackages = await PackagesParser.fetchPackages();
      allPackages.sort((a, b) => a.name.localeCompare(b.name));

      updateStats(allPackages.length);
      stampSync(allPackages.length);
      updateMeta(allPackages.length, allPackages.length, '');
      renderTools(container, allPackages, '');

      Search.init(allPackages, (results, query) => {
        const grid = document.getElementById('toolsGrid');
        updateMeta(results.length, allPackages.length, query);
        renderTools(grid, results, query);
      });
    } catch (err) {
      gridError(container, err.message);
    }
  }

  /* --- Sync stamp: the live-repo proof --- */
  function stampSync(count) {
    const now = new Date();
    const iso = now.toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
    const stamp = document.getElementById('syncStamp');
    const aside = document.getElementById('syncAside');
    const line = document.getElementById('syncLine');
    if (stamp) stamp.textContent = 'LATEST SYNC: ' + iso;
    if (aside) aside.textContent = 'TOOLS: ' + count + ' · AUTO-UPDATED 24/7';
    if (line) {
      line.classList.remove('syncline-anim');
      void line.offsetWidth;
      line.classList.add('syncline-anim');
    }
  }

  /* --- Rendering --- */
  function renderTools(container, packages, query) {
    if (packages.length === 0) {
      container.innerHTML = `
        <div class="empty-state empty-state--full" style="grid-column:1/-1">
          <div class="empty-state__icon">&#9633;</div>
          <p>No records match "<strong>${escapeHtml(query)}</strong>" — try another term.</p>
        </div>
      `;
      return;
    }

    const total = allPackages.length;
    const capped = !query && total > PREVIEW;
    const shown = capped ? packages.slice(0, PREVIEW) : packages;

    let html = shown.map((pkg, i) => toolRecord(pkg, i + 1)).join('');
    if (capped) {
      html += `
        <div class="viewmore" style="grid-column:1/-1">
          <button type="button" class="btn btn--paper" data-action="viewall" aria-label="Render the full index of ${total} tools">view full index &mdash; ${total} records <span class="arrow">&darr;</span></button>
        </div>
      `;
    }
    container.innerHTML = html;
  }

  function viewAll() {
    const grid = document.getElementById('toolsGrid');
    if (!grid || !allPackages.length) return;
    grid.innerHTML = allPackages.map((pkg, i) => toolRecord(pkg, i + 1)).join('');
    updateMeta(allPackages.length, allPackages.length, '');
  }

  const SEC_KEY = {
    net: 'net',
    network: 'net',
    networking: 'net',
    security: 'security',
    recon: 'recon',
    web: 'web',
    devel: 'devel',
    development: 'devel',
  };

  function secKey(section) {
    return SEC_KEY[String(section || '').trim().toLowerCase()] || 'other';
  }

  function toolRecord(pkg, pos) {
    const delay = Math.min((pos - 1) * 0.035, 0.63);
    const installCmd = 'pkg install ' + pkg.name;
    const idx = String(pos).padStart(3, '0');
    const skey = secKey(pkg.section);
    const section =
      pkg.section && pkg.section !== 'other'
        ? `<span class="record__sec" data-sec="${skey}">${escapeHtml(pkg.section)}</span>`
        : '';
    const homepage = pkg.homepage
      ? `<a class="record__link" href="${escapeHtml(pkg.homepage)}" target="_blank" rel="noopener">homepage &nearr;</a>`
      : `<span class="record__link" aria-hidden="true">no homepage on file</span>`;

    return `
      <article class="record" data-sec="${skey}" style="animation-delay:${delay}s">
        <div class="record__head">
          <a class="record__name" href="tool.html?name=${encodeURIComponent(pkg.name)}"><span class="n">[${idx}]</span>${escapeHtml(pkg.name)}</a>
          ${pkg.version ? `<span class="record__ver">v${escapeHtml(pkg.version)}</span>` : ''}
        </div>
        ${section}
        <p class="record__desc">${escapeHtml(pkg.description)}</p>
        <div class="record__foot">
          ${homepage}
          <button type="button" class="record__install" data-cmd="${escapeHtml(installCmd)}" aria-label="Copy install command for ${escapeHtml(pkg.name)}">$ ${escapeHtml(installCmd)}</button>
        </div>
      </article>
    `;
  }

  /* --- Meta --- */
  function updateMeta(shown, total, query) {
    const meta = document.getElementById('searchMeta');
    if (!meta) return;
    if (query) {
      meta.innerHTML = `SHOWING <strong>${shown}</strong> OF <strong>${total}</strong> RECORDS FOR &ldquo;${escapeHtml(query)}&rdquo;`;
    } else if (total > PREVIEW) {
      meta.innerHTML = `SHOWING <strong>${PREVIEW}</strong> OF <strong>${total}</strong> RECORDS &middot; SEARCH OR VIEW THE FULL INDEX`;
    } else {
      meta.innerHTML = `<strong>${total}</strong> TOOL RECORDS AVAILABLE &middot; SORTED ALPHABETICALLY`;
    }
  }

  /* --- Stats --- */
  function updateStats(count) {
    const el = document.getElementById('toolCount');
    if (!el) return;
    const reduce =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      el.textContent = count;
      return;
    }
    const start = performance.now();
    const dur = 640;
    const step = (t) => {
      const p = Math.min((t - start) / dur, 1);
      el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * count);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* --- Error --- */
  function gridError(container, message) {
    container.innerHTML = `
      <div class="error-state error-state--full" style="grid-column:1/-1">
        <div class="error-state__icon">&#9888;</div>
        <p class="error-state__msg">[ERROR] failed to read repository index: ${escapeHtml(message)}</p>
        <button class="error-state__retry" onclick="App.retry()">retry &rarr;</button>
      </div>
    `;
    const aside = document.getElementById('syncAside');
    if (aside) aside.textContent = 'INDEX UNREADABLE';
  }

  /* --- Copy (install buttons + command plates) --- */
  function copyCmd(btn) {
    const cmd = btn.dataset.cmd || '';
    if (!cmd) return;
    navigator.clipboard.writeText(cmd).then(() => {
      const orig = btn.textContent;
      btn.textContent = 'Copied!';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.textContent = orig;
        btn.classList.remove('copied');
      }, 1500);
    });
  }

  /* --- Retry --- */
  function retry() {
    loadPackages();
  }

  /* --- Menu Toggle --- */
  function setupMenuToggle() {
    const btn = document.getElementById('menuBtn');
    const nav = document.getElementById('navLinks');
    if (!btn || !nav) return;

    btn.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
      nav.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }));
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.masthead__inner')) {
        nav.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* --- Scroll chrome: back-to-top, document-feed rail, section scrollspy --- */
  function setupScrollChrome() {
    const btn = document.getElementById('backToTop');
    const feed = document.getElementById('feed');
    const navLinks = Array.prototype.slice.call(
      document.querySelectorAll('.masthead__nav a[href^="#"]')
    );
    const sections = navLinks
      .map((a) => document.querySelector(a.getAttribute('href')))
      .filter(Boolean);

    function onScroll() {
      const y = window.scrollY;
      if (btn) btn.classList.toggle('visible', y > 400);
      if (feed) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        feed.style.transform = 'scaleY(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
      }
      if (sections.length) {
        let current = sections[0];
        for (let i = 0; i < sections.length; i++) {
          if (sections[i].offsetTop - 140 <= y) current = sections[i];
        }
        navLinks.forEach((a, i) => a.classList.toggle('active', sections[i] === current));
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    onScroll();

    if (btn) {
      btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  /* --- Utility --- */
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  return { init, copyCmd, retry, viewAll };
})();

document.addEventListener('DOMContentLoaded', App.init);

/* Copy buttons + view-all (delegated) */
document.addEventListener('click', (e) => {
  const va = e.target.closest('[data-action="viewall"]');
  if (va) {
    e.preventDefault();
    App.viewAll();
    return;
  }
  const btn = e.target.closest('.cmdplate__copy, .record__install');
  if (btn) App.copyCmd(btn);
});