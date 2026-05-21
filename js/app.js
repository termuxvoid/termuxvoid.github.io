/* ============================================
   TermuxVoid - Main Application
   ============================================ */

const App = (() => {
  let allPackages = [];

  async function init() {
    setupMenuToggle();
    setupBackToTop();
    setupCopyButtons();
    await loadPackages();
  }

  /* --- Packages Loading --- */
  async function loadPackages() {
    const container = document.getElementById('toolsGrid');
    showLoader(container);

    try {
      allPackages = await PackagesParser.fetchPackages();
      allPackages.sort((a, b) => a.name.localeCompare(b.name));

      updateStats(allPackages.length);
      showSearchPrompt();
      updateMeta(allPackages.length, allPackages.length, '');

      // Wire up search with callback
      Search.init(allPackages, (results, query) => {
        if (!query) {
          showSearchPrompt();
          updateMeta(allPackages.length, allPackages.length, '');
        } else {
          renderTools(results, query);
          updateMeta(results.length, allPackages.length, query);
        }
      });
    } catch (err) {
      showError(container, err.message);
    }
  }

  /* --- Search Prompt --- */
  function showSearchPrompt() {
    const container = document.getElementById('toolsGrid');
    container.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-state__icon">&#128269;</div>
        <p style="color:var(--text-secondary);margin-top:0.5rem">Type to search <strong>${allPackages.length}</strong> tools by name, description, or category</p>
        <a href="https://github.com/termuxvoid/repo/blob/main/assets/PACKAGES.md" target="_blank" rel="noopener" style="display:inline-block;margin-top:0.8rem;padding:0.45rem 1rem;background:var(--accent);color:#000;font-weight:600;font-size:0.9rem;border-radius:var(--radius-md);transition:all 0.25s">View All Tools &rarr;</a>
      </div>
    `;
  }

  /* --- Rendering --- */
  function renderTools(packages, query) {
    const container = document.getElementById('toolsGrid');

    if (packages.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state__icon">&#128269;</div>
          <p>No tools found for "<strong>${escapeHtml(query)}</strong>"</p>
        </div>
      `;
      return;
    }

    container.innerHTML = packages.map((pkg, i) => toolCard(pkg, i)).join('');
  }

  function toolCard(pkg, index) {
    const delay = Math.min(index * 0.02, 0.5);
    const installCmd = `pkg install ${pkg.name}`;
    const homepageLink = pkg.homepage
      ? `<a class="tool-card__link" href="${escapeHtml(pkg.homepage)}" target="_blank" rel="noopener">Homepage &#8599;</a>`
      : '';

    return `
      <div class="tool-card" style="animation-delay:${delay}s">
        <div class="tool-card__header">
          <span class="tool-card__name">${escapeHtml(pkg.name)}</span>
          ${pkg.version ? `<span class="tool-card__version">v${escapeHtml(pkg.version)}</span>` : ''}
        </div>
        ${pkg.section !== 'other' ? `<span class="tool-card__section">${escapeHtml(pkg.section)}</span>` : ''}
        <p class="tool-card__desc">${escapeHtml(pkg.description)}</p>
        <div class="tool-card__footer">
          ${homepageLink}
          <button class="tool-card__install" onclick="App.copyInstall(this,'${escapeHtml(installCmd)}')" title="Copy install command">
            $ ${escapeHtml(installCmd)}
          </button>
        </div>
      </div>
    `;
  }

  /* --- Meta --- */
  function updateMeta(shown, total, query) {
    const meta = document.getElementById('searchMeta');
    if (query) {
      meta.textContent = `Showing ${shown} of ${total} tools`;
    } else {
      meta.textContent = `${total} tools available`;
    }
  }

  /* --- Stats --- */
  function updateStats(count) {
    const el = document.getElementById('toolCount');
    if (el) el.textContent = count;
  }

  /* --- Loader / Error --- */
  function showLoader(container) {
    container.innerHTML = `
      <div class="loader" style="grid-column:1/-1">
        <div class="loader__spinner"></div>
        <span class="loader__text">Loading tools from repository...</span>
      </div>
    `;
  }

  function showError(container, message) {
    container.innerHTML = `
      <div class="error-state" style="grid-column:1/-1">
        <div class="error-state__icon">&#9888;</div>
        <p class="error-state__msg">Failed to load tools: ${escapeHtml(message)}</p>
        <button class="error-state__retry" onclick="App.retry()">Retry</button>
      </div>
    `;
  }

  /* --- Copy Install Command --- */
  function copyInstall(btn, cmd) {
    navigator.clipboard.writeText(cmd).then(() => {
      btn.textContent = 'Copied!';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.textContent = '$ ' + cmd;
        btn.classList.remove('copied');
      }, 1500);
    });
  }

  /* --- Menu Toggle --- */
  function setupMenuToggle() {
    const btn = document.getElementById('menuBtn');
    const nav = document.getElementById('navLinks');
    if (!btn || !nav) return;

    btn.addEventListener('click', () => nav.classList.toggle('open'));
    nav.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => nav.classList.remove('open'));
    });
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.header')) nav.classList.remove('open');
    });
  }

  /* --- Back to Top --- */
  function setupBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;
    window.addEventListener('scroll', () => {
      btn.classList.toggle('visible', window.scrollY > 400);
    });
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* --- Copy Buttons (installation section) --- */
  function setupCopyButtons() {
    document.querySelectorAll('.copy-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const code = btn.closest('.code-block').querySelector('code').textContent;
        navigator.clipboard.writeText(code).then(() => {
          btn.textContent = 'Copied!';
          btn.classList.add('copied');
          setTimeout(() => {
            btn.textContent = 'Copy';
            btn.classList.remove('copied');
          }, 1500);
        });
      });
    });
  }

  /* --- Retry --- */
  function retry() {
    loadPackages();
  }

  /* --- Utility --- */
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  return { init, copyInstall, retry };
})();

document.addEventListener('DOMContentLoaded', App.init);
