/* ============================================
   TermuxVoid - Packages Parser
   ============================================ */

const PackagesParser = (() => {
  const PACKAGES_URL =
    'https://raw.githubusercontent.com/termuxvoid/repo/refs/heads/main/dists/termuxvoid/main/binary-all/Packages';

  /**
   * Parse a Debian Packages file into an array of objects.
   * Each block is separated by a blank line.
   * Continuation lines start with a single space.
   */
  function parse(text) {
    const blocks = text.split(/\n\n+/).filter((b) => b.trim());
    return blocks.map(parseBlock).filter((p) => p.name);
  }

  function parseBlock(block) {
    const pkg = {};
    let currentKey = null;

    for (const line of block.split('\n')) {
      if (line.startsWith(' ')) {
        // Continuation line — append to current field
        if (currentKey && pkg[currentKey] !== undefined) {
          pkg[currentKey] += ' ' + line.trim();
        }
        continue;
      }

      const colonIdx = line.indexOf(':');
      if (colonIdx === -1) continue;

      const key = line.slice(0, colonIdx).trim();
      const value = line.slice(colonIdx + 1).trim();

      currentKey = key;
      pkg[key] = value;
    }

    return {
      name: pkg.Package || '',
      version: pkg.Version || '',
      description: pkg.Description || '',
      homepage: pkg.Homepage || '',
      section: pkg.Section || 'other',
      depends: pkg.Depends || '',
      maintainer: pkg.Maintainer || '',
      size: pkg.Size || '0',
    };
  }

  /**
   * Fetch and parse packages from the remote repository.
   * Returns a promise that resolves to an array of package objects.
   */
  async function fetchPackages() {
    const response = await fetch(PACKAGES_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch packages: ${response.status}`);
    }
    const text = await response.text();
    return parse(text);
  }

  return { parse, fetchPackages };
})();
