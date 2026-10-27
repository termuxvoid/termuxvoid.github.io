/* ============================================
   TermuxVoid - shared UI helpers
   ============================================ */

const TV = (() => {
  const GROUPS = [
    { key: 'all', label: 'All tools', short: 'ALL', icon: 'cat-all' },
    { key: 'recon', label: 'Recon', short: 'RECON', icon: 'cat-recon' },
    { key: 'net', label: 'Network', short: 'NET', icon: 'cat-net' },
    { key: 'tunnel', label: 'Tunnels', short: 'TUNNEL', icon: 'cat-tunnel' },
    { key: 'web', label: 'Web', short: 'WEB', icon: 'cat-web' },
    { key: 'security', label: 'Exploitation', short: 'SEC', icon: 'cat-security' },
    { key: 'password', label: 'Passwords', short: 'PASS', icon: 'cat-password' },
    { key: 'ai', label: 'AI', short: 'AI', icon: 'cat-ai' },
    { key: 'android', label: 'Android', short: 'ANDROID', icon: 'cat-android' },
    { key: 'crypto', label: 'Crypto & stego', short: 'CRYPTO', icon: 'cat-crypto' },
    { key: 'social', label: 'OSINT', short: 'OSINT', icon: 'cat-social' },
    { key: 'utils', label: 'Utilities', short: 'UTIL', icon: 'cat-utils' },
    { key: 'devel', label: 'Development', short: 'DEV', icon: 'cat-devel' },
    { key: 'other', label: 'Other', short: 'OTHER', icon: 'cat-other' },
  ];

  const SECTION_GROUPS = {
    recon: 'recon',
    network: 'net',
    net: 'net',
    networking: 'net',
    dns: 'net',
    tunnel: 'tunnel',
    web: 'web',
    security: 'security',
    cracking: 'password',
    scanner: 'security',
    exploitation: 'security',
    password: 'password',
    utils: 'utils',
    misc: 'utils',
    editors: 'utils',
    shells: 'utils',
    shell: 'utils',
    games: 'utils',
    science: 'utils',
    devel: 'devel',
    development: 'devel',
    ruby: 'devel',
    libs: 'devel',
    ai: 'ai',
    android: 'android',
    crypto: 'crypto',
    stego: 'crypto',
    social: 'social',
  };

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, (ch) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    })[ch]);
  }

  function groupKey(section) {
    return SECTION_GROUPS[String(section || '').trim().toLowerCase()] || 'other';
  }

  function groupMeta(key) {
    return GROUPS.find((g) => g.key === key) || GROUPS[GROUPS.length - 1];
  }

  function groupLabel(section) {
    return groupMeta(groupKey(section)).label;
  }

  function sectionLabel(section) {
    const clean = String(section || '').trim();
    return clean && clean.toLowerCase() !== 'other' ? clean : 'General';
  }

  function iconFor(name) {
    const icons = window.TV_ICONS || {};
    return 'assets/icons/' + encodeURIComponent(icons[name] || 'default.svg');
  }

  function categoryIcon(key) {
    return 'assets/icons/' + groupMeta(key).icon + '.svg';
  }

  function installCommand(name) {
    return 'pkg install ' + name;
  }

  function safeUrl(value) {
    if (!value || !String(value).trim()) return '';
    try {
      const url = new URL(value, window.location.href);
      return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : '';
    } catch (_) {
      return '';
    }
  }

  function formatSize(bytes) {
    const value = parseInt(bytes, 10);
    if (!Number.isFinite(value) || value <= 0) return '—';
    if (value < 1024) return value + ' B';
    if (value < 1024 * 1024) return (value / 1024).toFixed(1) + ' KB';
    return (value / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function copyText(text, button) {
    const done = () => {
      if (!button) return;
      const original = button.textContent;
      button.textContent = 'Copied';
      button.classList.add('copied');
      setTimeout(() => {
        button.textContent = original;
        button.classList.remove('copied');
      }, 1400);
    };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done).catch(() => {
        if (!button) return;
        button.textContent = 'Copy failed';
        setTimeout(() => { button.textContent = 'Copy'; }, 1400);
      });
      return;
    }

    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    try {
      document.execCommand('copy');
      done();
    } catch (_) {
      if (button) button.textContent = 'Copy failed';
    }
    document.body.removeChild(area);
  }

  function setupCopy() {
    document.addEventListener('click', (event) => {
      const button = event.target.closest('[data-copy]');
      if (!button) return;
      event.preventDefault();
      copyText(button.dataset.copy, button);
    });
  }

  function setupMenu() {
    const button = document.getElementById('menuBtn');
    const nav = document.getElementById('navLinks');
    if (!button || !nav) return;

    const close = () => {
      nav.classList.remove('open');
      button.setAttribute('aria-expanded', 'false');
    };

    button.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      button.setAttribute('aria-expanded', String(open));
    });

    nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', close));
    document.addEventListener('click', (event) => {
      if (!event.target.closest('.masthead__inner')) close();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') close();
    });
  }

  function setupBackToTop() {
    const button = document.getElementById('backToTop');
    if (!button) return;

    const onScroll = () => button.classList.toggle('visible', window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    button.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  function init() {
    setupMenu();
    setupCopy();
    setupBackToTop();
    document.addEventListener('error', (event) => {
      const img = event.target;
      if (img.tagName !== 'IMG' || !img.classList.contains('tool-icon') || img.dataset.fallback) return;
      img.dataset.fallback = '1';
      img.src = 'assets/icons/default.svg';
    }, true);
  }

  return {
    GROUPS,
    escapeHtml,
    groupKey,
    groupMeta,
    groupLabel,
    sectionLabel,
    iconFor,
    categoryIcon,
    installCommand,
    safeUrl,
    formatSize,
    copyText,
    init,
  };
})();

document.addEventListener('DOMContentLoaded', TV.init);
