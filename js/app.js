/* ============================================
   TermuxVoid - live registry
   ============================================ */

const App = (() => {
  const PREVIEW = 9;
  let allPackages = [];
  let group = 'all';
  let showAll = false;
  let query = '';
  let debounceTimer = null;

  async function init() {
    setupSearch();
    setupGroups();
    setupScrollChrome();
    await loadPackages();
  }

  async function loadPackages() {
    const grid = document.getElementById('toolsGrid');
    grid.innerHTML = `<div class="loader loader--full"><span class="loader__spinner"></span><span>Reading repository index…</span></div>`;

    try {
      allPackages = await PackagesParser.fetchPackages();
      allPackages.sort((a, b) => a.name.localeCompare(b.name));
      renderGroups();
      updateStats(allPackages.length);
      stampIndex(allPackages.length);
      applyFilters();
    } catch (error) {
      gridError(grid, error.message);
    }
  }

  function setupSearch() {
    const input = document.getElementById('searchInput');
    const clear = document.getElementById('searchClear');
    if (!input || !clear) return;

    input.addEventListener('input', () => {
      query = input.value;
      clear.classList.toggle('visible', query.length > 0);
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        showAll = false;
        applyFilters();
      }, 120);
    });

    clear.addEventListener('click', () => {
      input.value = '';
      query = '';
      clear.classList.remove('visible');
      showAll = false;
      applyFilters();
      input.focus();
    });

    document.addEventListener('keydown', (event) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);
      if (event.key === '/' && !typing) {
        event.preventDefault();
        input.focus();
      }
      if (event.key === 'Escape' && document.activeElement === input) input.blur();
    });
  }

  function setupGroups() {
    const holder = document.getElementById('groupChips');
    if (!holder) return;
    holder.addEventListener('click', (event) => {
      const chip = event.target.closest('[data-group]');
      if (!chip || chip.dataset.group === group) return;
      group = chip.dataset.group;
      showAll = false;
      holder.querySelectorAll('[data-group]').forEach((item) => {
        const active = item.dataset.group === group;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      applyFilters();
    });
  }

  function renderGroups() {
    const holder = document.getElementById('groupChips');
    if (!holder) return;

    const counts = {};
    allPackages.forEach((pkg) => {
      const key = TV.groupKey(pkg.section);
      counts[key] = (counts[key] || 0) + 1;
    });

    holder.innerHTML = TV.GROUPS.filter((item) => item.key === 'all' || counts[item.key])
      .map((item) => {
        const count = item.key === 'all' ? allPackages.length : counts[item.key];
        return `<button type="button" class="chip${item.key === group ? ' is-active' : ''}" data-group="${item.key}" aria-pressed="${item.key === group}">
          <img src="${TV.categoryIcon(item.key)}" alt="" width="17" height="17">
          <span>${item.label}</span><b>${count}</b>
        </button>`;
      })
      .join('');

  }

  function applyFilters() {
    const needle = query.trim().toLowerCase();
    const results = allPackages.filter((pkg) => {
      if (group !== 'all' && TV.groupKey(pkg.section) !== group) return false;
      if (!needle) return true;
      return [pkg.name, pkg.description, pkg.section, TV.groupLabel(pkg.section)]
        .join(' ')
        .toLowerCase()
        .includes(needle);
    });

    const grid = document.getElementById('toolsGrid');
    renderTools(grid, results, needle);
    updateMeta(results.length, allPackages.length, needle);
  }

  function renderTools(container, packages, needle) {
    if (!packages.length) {
      const label = query.trim()
        ? 'No tools match “' + TV.escapeHtml(query.trim()) + '”'
        : 'No tools in ' + TV.escapeHtml(TV.groupMeta(group).label);
      container.innerHTML = `<div class="empty-state empty-state--full">
        <span class="empty-state__icon">?</span>
        <p>${label}.</p>
        <button type="button" class="btn btn--small" data-action="reset">Clear filters</button>
      </div>`;
      return;
    }

    const capped = !needle && group === 'all' && !showAll && packages.length > PREVIEW;
    const shown = capped ? packages.slice(0, PREVIEW) : packages;

    let html = shown.map((pkg) => toolRecord(pkg)).join('');
    if (capped) {
      html += `<div class="viewmore">
        <button type="button" class="btn btn--paper" data-action="viewall">View all ${packages.length} tools <span class="arrow">↓</span></button>
      </div>`;
    }
    container.innerHTML = html;
  }

  function toolRecord(pkg) {
    const name = TV.escapeHtml(pkg.name);
    const command = TV.installCommand(pkg.name);
    const groupKey = TV.groupKey(pkg.section);
    const groupLabel = TV.groupLabel(pkg.section);
    const homepage = TV.safeUrl(pkg.homepage);
    const link = homepage
      ? `<a class="record__link" href="${TV.escapeHtml(homepage)}" target="_blank" rel="noopener">Homepage ↗</a>`
      : '';

    return `<article class="record" data-group="${groupKey}">
      <div class="record__top">
        <span class="record__icon"><img class="tool-icon" src="${TV.iconFor(pkg.name)}" alt="" width="40" height="40" loading="lazy"></span>
        <div class="record__title">
          <a class="record__name" href="tool.html?name=${encodeURIComponent(pkg.name)}">${name}</a>
          ${pkg.version ? `<span class="record__ver">v${TV.escapeHtml(pkg.version)}</span>` : ''}
        </div>
        <span class="record__cat">${TV.escapeHtml(groupLabel)}</span>
      </div>
      <p class="record__desc">${TV.escapeHtml(pkg.description)}</p>
      <div class="record__foot">
        <button type="button" class="record__install" data-copy="${TV.escapeHtml(command)}" aria-label="Copy install command for ${name}">$ ${TV.escapeHtml(command)}</button>
        <div class="record__links">
          ${link}
          <a class="record__more" href="tool.html?name=${encodeURIComponent(pkg.name)}">Details <span aria-hidden="true">→</span></a>
        </div>
      </div>
    </article>`;
  }

  function updateMeta(shown, total, needle) {
    const meta = document.getElementById('searchMeta');
    if (!meta) return;
    if (needle) {
      meta.innerHTML = `<strong>${shown}</strong> of <strong>${total}</strong> tools for “${TV.escapeHtml(query.trim())}”`;
    } else if (group !== 'all') {
      meta.innerHTML = `<strong>${shown}</strong> tools in <strong>${TV.escapeHtml(TV.groupMeta(group).label)}</strong>`;
    } else if (total > PREVIEW && !showAll) {
      meta.innerHTML = `Showing <strong>${PREVIEW}</strong> of <strong>${total}</strong> tools · search or view all`;
    } else {
      meta.innerHTML = `<strong>${total}</strong> tools · sorted alphabetically`;
    }
  }

  function updateStats(count) {
    document.querySelectorAll('#heroCount, #heroCount2').forEach((el) => {
      el.textContent = count;
    });
    const input = document.getElementById('searchInput');
    if (input) input.placeholder = 'Search ' + count + ' security tools…';
    const countEl = document.getElementById('toolCount');
    if (!countEl) return;

    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      countEl.textContent = count;
      return;
    }

    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / 620, 1);
      countEl.textContent = Math.round((1 - Math.pow(1 - progress, 3)) * count);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function stampIndex(count) {
    const now = new Date();
    const stamp = document.getElementById('syncStamp');
    const aside = document.getElementById('syncAside');
    if (stamp) {
      stamp.textContent = 'INDEX LOADED ' + now.toISOString().slice(11, 16) + ' UTC';
    }
    if (aside) aside.textContent = count + ' TOOLS · APT + PACMAN';
  }

  function gridError(container, message) {
    container.innerHTML = `<div class="error-state error-state--full">
      <span class="error-state__icon">!</span>
      <p class="error-state__msg">Could not read the repository index: ${TV.escapeHtml(message)}</p>
      <button type="button" class="btn btn--small" data-action="retry">Try again</button>
    </div>`;
    const aside = document.getElementById('syncAside');
    if (aside) aside.textContent = 'INDEX UNREADABLE';
    const meta = document.getElementById('searchMeta');
    if (meta) meta.textContent = 'Index unavailable.';
  }

  function reset() {
    query = '';
    group = 'all';
    showAll = false;
    const input = document.getElementById('searchInput');
    const clear = document.getElementById('searchClear');
    if (input) input.value = '';
    if (clear) clear.classList.remove('visible');
    document.querySelectorAll('#groupChips [data-group]').forEach((chip) => {
      const active = chip.dataset.group === 'all';
      chip.classList.toggle('is-active', active);
      chip.setAttribute('aria-pressed', String(active));
    });
    applyFilters();
  }

  function setupScrollChrome() {
    const feed = document.getElementById('feed');
    const navLinks = Array.from(document.querySelectorAll('.masthead__nav a[href^="#"]'));
    const sections = navLinks
      .map((link) => document.querySelector(link.getAttribute('href')))
      .filter(Boolean);

    function onScroll() {
      const y = window.scrollY;
      if (feed) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        feed.style.transform = 'scaleY(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
      }
      if (!sections.length) return;
      let current = sections[0];
      sections.forEach((section) => {
        if (section.offsetTop - 150 <= y) current = section;
      });
      navLinks.forEach((link, index) => {
        const active = sections[index] === current;
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    onScroll();
  }

  document.addEventListener('click', (event) => {
    const action = event.target.closest('[data-action]');
    if (!action) return;
    if (action.dataset.action === 'viewall') {
      showAll = true;
      applyFilters();
    }
    if (action.dataset.action === 'retry') loadPackages();
    if (action.dataset.action === 'reset') reset();
  });

  return { init, reset };
})();

document.addEventListener('DOMContentLoaded', App.init);
