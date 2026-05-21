/* ============================================
   TermuxVoid - Search Module
   ============================================ */

const Search = (() => {
  let allPackages = [];
  let debounceTimer = null;

  function init(packages) {
    allPackages = packages;
    const input = document.getElementById('searchInput');
    const clearBtn = document.getElementById('searchClear');

    input.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => performSearch(input.value), 200);

      // Toggle clear button
      clearBtn.classList.toggle('visible', input.value.length > 0);
    });

    clearBtn.addEventListener('click', () => {
      input.value = '';
      clearBtn.classList.remove('visible');
      performSearch('');
      input.focus();
    });

    // Keyboard shortcut: / to focus search
    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== input) {
        e.preventDefault();
        input.focus();
      }
      if (e.key === 'Escape' && document.activeElement === input) {
        input.blur();
      }
    });
  }

  function performSearch(query) {
    const trimmed = query.trim().toLowerCase();
    const results = trimmed
      ? allPackages.filter(
          (p) =>
            p.name.toLowerCase().includes(trimmed) ||
            p.description.toLowerCase().includes(trimmed) ||
            p.section.toLowerCase().includes(trimmed)
        )
      : allPackages;

    renderTools(results, trimmed);
    updateMeta(results.length, allPackages.length, trimmed);
  }

  function updateMeta(shown, total, query) {
    const meta = document.getElementById('searchMeta');
    if (query) {
      meta.textContent = `Showing ${shown} of ${total} tools`;
    } else {
      meta.textContent = `${total} tools available`;
    }
  }

  return { init, performSearch };
})();
