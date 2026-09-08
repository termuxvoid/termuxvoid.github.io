/* ============================================
   TermuxVoid - Theme Switcher
   Light / Dark, persisted to localStorage,
   falls back to system preference.
   ============================================ */

const Theme = (() => {
  const STORAGE_KEY = 'termuxvoid-theme';

  function getSystemTheme() {
    return window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  function getSavedTheme() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved === 'dark' || saved === 'light' ? saved : null;
    } catch (_) {
      return null;
    }
  }

  function resolveTheme() {
    return getSavedTheme() || getSystemTheme();
  }

  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      const color = theme === 'dark' ? '#000000' : '#1d3bb3';
      meta.setAttribute('content', color);
    }
    syncToggle(theme);
  }

  function syncToggle(theme) {
    document.querySelectorAll('.theme-toggle').forEach((btn) => {
      btn.setAttribute('data-theme', theme);
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
      const ico = btn.querySelector('.theme-ico');
      if (ico) ico.textContent = theme === 'dark' ? '\u2600' : '\u263E';
      const lbl = btn.querySelector('.theme-lbl');
      if (lbl) lbl.textContent = theme === 'dark' ? 'light' : 'dark';
    });
  }

  function toggle() {
    const next =
      document.documentElement.getAttribute('data-theme') === 'dark'
        ? 'light'
        : 'dark';
    apply(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch (_) { /* storage unavailable */ }
  }

  function init() {
    apply(resolveTheme());
    document.querySelectorAll('.theme-toggle').forEach((btn) => {
      btn.addEventListener('click', toggle);
    });
    if (window.matchMedia) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const onSystemChange = () => {
        if (!getSavedTheme()) apply(getSystemTheme());
      };
      if (mq.addEventListener) mq.addEventListener('change', onSystemChange);
      else if (mq.addListener) mq.addListener(onSystemChange);
    }
  }

  return { init, toggle };
})();

document.addEventListener('DOMContentLoaded', Theme.init);