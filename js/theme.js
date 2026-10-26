/* ============================================
   TermuxVoid - Theme Switcher
   Loaded in <head> so the theme is set before
   the first paint. Toggle wiring waits for DOM.
   ============================================ */

const Theme = (() => {
  const STORAGE_KEY = 'termuxvoid-theme';
  const COLORS = { dark: '#0b0712', light: '#f7f2ea' };

  function systemTheme() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  function savedTheme() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved === 'dark' || saved === 'light' ? saved : null;
    } catch (_) {
      return null;
    }
  }

  function resolve() {
    return savedTheme() || systemTheme();
  }

  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', COLORS[theme]);
    document.querySelectorAll('.theme-toggle').forEach((button) => {
      button.setAttribute('data-theme', theme);
      button.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
      const icon = button.querySelector('.theme-ico');
      if (icon) icon.textContent = theme === 'dark' ? '\u2600' : '\u263e';
      const label = button.querySelector('.theme-lbl');
      if (label) label.textContent = theme === 'dark' ? 'light' : 'dark';
    });
  }

  function toggle() {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    apply(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch (_) {}
  }

  function init() {
    apply(resolve());
    document.querySelectorAll('.theme-toggle').forEach((button) => {
      button.addEventListener('click', toggle);
    });
    if (window.matchMedia) {
      const query = window.matchMedia('(prefers-color-scheme: dark)');
      const onChange = () => { if (!savedTheme()) apply(systemTheme()); };
      if (query.addEventListener) query.addEventListener('change', onChange);
      else if (query.addListener) query.addListener(onChange);
    }
  }

  apply(resolve());

  return { init, toggle, apply };
})();

document.addEventListener('DOMContentLoaded', Theme.init);
