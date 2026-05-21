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
      // Sort alphabetically
      allPackages.sort((a, b) => a.name.localeCompare(b.name));

      updateStats(allPackages.length);
      renderTools(allPackages);
      Search.init(allPackages);

      const meta = document.getElementById('searchMeta');
      meta.textContent = `${allPackages.length} tools available`;
    } catch (err) {
      showError(container, err.message);
    }
  }

  /* --- Rendering --- */
  function renderTools(packages, query = '') {
    const container = document.getElementById('toolsGrid');

    if (packages.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state__icon">🔍</div>
          <p>No tools found for "<strong>${escapeHtml(query)}</strong>"</p>
        </div>
      `;
      return;
    }

    container.innerHTML = packages
      .map((pkg, i) => toolCard(pkg, i))
      .join('');
  }

  function toolCard(pkg, index) {
    const delay = Math.min(index * 0.03, 0.6);
    const installCmd = `pkg install ${pkg.name}`;
    const homepageLink = pkg.homepage
      ? `<a class="tool-card__link" href="${escapeHtml(pkg.homepage)}" target="_blank" rel="noopener">
           Homepage ↗
         </a>`
      : '';

    return `
      <div class="tool-card" style="animation-delay: ${delay}s">
        <div class="tool-card__header">
          <span class="tool-card__name">${escapeHtml(pkg.name)}</span>
          ${pkg.version ? `<span class="tool-card__version">v${escapeHtml(pkg.version)}</span>` : ''}
        </div>
        ${pkg.section !== 'other' ? `<span class="tool-card__section">${escapeHtml(pkg.section)}</span>` : ''}
        <p class="tool-card__desc">${escapeHtml(pkg.description)}</p>
        <div class="tool-card__footer">
          ${homepageLink}
          <button class="tool-card__install" onclick="App.copyInstall('${escapeHtml(installCmd)}')" title="Copy install command">
            $ ${escapeHtml(installCmd)}
          </button>
        </div>
      </div>
    `;
  }

  /* --- Stats --- */
  function updateStats(count) {
    const el = document.getElementById('toolCount');
    if (el) el.textContent = count;
  }

  /* --- Loader / Error --- */
  function showLoader(container) {
    container.innerHTML = `
      <div class="loader" style="grid-column: 1 / -1;">
        <div class="loader__spinner"></div>
        <span class="loader__text">Loading tools from repository...</span>
      </div>
    `;
  }

  function showError(container, message) {
    container.innerHTML = `
      <div class="error-state" style="grid-column: 1 / -1;">
        <div class="error-state__icon">⚠️</div>
        <p class="error-state__msg">Failed to load tools: ${escapeHtml(message)}</p>
        <button class="error-state__retry" onclick="App.retry()">Retry</button>
      </div>
    `;
  }

  /* --- Copy Install Command --- */
  function copyInstall(cmd) {
    navigator.clipboard.writeText(cmd).then(() => {
      showToast('Copied: ' + cmd);
    });
  }

  /* --- Toast --- */
  function showToast(msg) {
    let toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show', 'toast--success');
    setTimeout(() => toast.classList.remove('show'), 2000);
  }

  /* --- Menu Toggle --- */
  function setupMenuToggle() {
    const btn = document.getElementById('menuBtn');
    const nav = document.getElementById('navLinks');
    if (!btn || !nav) return;

    btn.addEventListener('click', () => {
      nav.classList.toggle('open');
    });

    // Close on link click
    nav.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => nav.classList.remove('open'));
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.header')) {
        nav.classList.remove('open');
      }
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

  /* --- Copy Buttons --- */
  function setupCopyButtons() {
    document.querySelectorAll('.copy-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const code = btn.closest('.code-block').querySelector('code').textContent;
        navigator.clipboard.writeText(code).then(() => {
          btn.textContent = '✓';
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

// Boot
document.addEventListener('DOMContentLoaded', App.init);
