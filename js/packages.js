/* ============================================
   TermuxVoid - Packages Parser
   ============================================ */

const PackagesParser = (() => {
  const PACKAGES_URL =
    'https://raw.githubusercontent.com/termuxvoid/repo/refs/heads/gh-pages/dists/termuxvoid/main/binary-all/Packages';
  const CACHE_KEY = 'termuxvoid_packages';
  const CACHE_TTL = 1000 * 60 * 30; // 30 minutes

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
      architecture: pkg.Architecture || '',
      description: pkg.Description || '',
      homepage: pkg.Homepage || '',
      section: pkg.Section || 'other',
      priority: pkg.Priority || '',
      depends: pkg.Depends || '',
      maintainer: pkg.Maintainer || '',
      filename: pkg.Filename || '',
      size: pkg.Size || '0',
      md5: pkg.MD5Sum || '',
      sha1: pkg.SHA1 || '',
      sha256: pkg.SHA256 || '',
      sha512: pkg.SHA512 || '',
    };
  }

  /**
   * Fetch and parse packages from the remote repository.
   * Returns a promise that resolves to an array of package objects.
   */
  async function fetchPackages() {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TTL) return data;
      }
    } catch {}

    const response = await fetch(PACKAGES_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch packages: ${response.status}`);
    }
    const text = await response.text();
    const packages = parse(text);

    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data: packages, timestamp: Date.now() }));
    } catch {}

    return packages;
  }

  return { parse, fetchPackages };
})();
