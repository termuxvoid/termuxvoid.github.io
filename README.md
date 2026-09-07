<p align="center">
  <img src="https://github.com/termuxvoid/repo/raw/main/img/termuxvoid_logo.png" alt="TermuxVoid" width="100">
</p>

<h1 align="center">TermuxVoid Website</h1>

<p align="center">
  Official landing page for the TermuxVoid Repository — advanced security tools for Termux, available as both APT (dpkg) and Pacman repositories.
</p>

<p align="center">
  <a href="https://termuxvoid.github.io"><img src="https://img.shields.io/badge/Site-Live-00ff41?style=for-the-badge&logo=googlechrome&logoColor=000" alt="Live Site"></a>
  <a href="https://github.com/TermuxVoid/repo/stargazers"><img src="https://img.shields.io/github/stars/TermuxVoid/repo?style=for-the-badge&logo=github&color=00ff41&labelColor=0a0a0a" alt="Stars"></a>
  <a href="https://github.com/TermuxVoid/repo/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-BSD_3--Clause-00ff41?style=for-the-badge&logo=opensourceinitiative&logoColor=000" alt="License"></a>
  <a href="https://t.me/nullxvoid"><img src="https://img.shields.io/badge/Telegram-Join-00ff41?style=for-the-badge&logo=telegram&logoColor=000" alt="Telegram"></a>
</p>

---

## Overview

A "Live Registry" single-page site built with vanilla HTML, CSS, and JavaScript, styled as a printed package index — cool form-paper ground, near-black ink, and a single carbon-blue stamp accent. It fetches package metadata directly from the TermuxVoid repository and lets users browse, search, and copy install commands for 200+ security tools — no frameworks, no build step, nothing hard-coded. Every record, count, and sync timestamp is read live from the repository. TermuxVoid ships the same tools as both an APT (dpkg) and a Pacman repository, so `pkg install` works on either setup.

## Features

| Feature | Description |
|---|---|
| **Live Registry** | Every record, count, and sync timestamp is fetched live from the remote `Packages` index — nothing hard-coded |
| **Fuzzy Search** | Fuzzy search across tool names, descriptions, and categories; press `/` to focus, `Esc` to dismiss |
| **Full-Index Reveal** | The front door prints the first 24 records; one click reveals the full index |
| **Tool Detail Pages** | Record sheets with version, dependencies, SHA256 checksums, and one-click copy |
| **Copy to Clipboard** | One-tap copy for install commands and checksums, with press feedback |
| **Responsive** | Fully responsive ledger layout with mobile menu and back-to-top |
| **Zero Dependencies** | Pure HTML/CSS/JS — no bundler, no framework, no npm |
| **Reduced Motion** | `prefers-reduced-motion` disables movement while keeping color and state feedback |

## Project Structure

```
.
├── index.html          # Landing page (hero, overview, search, FAQ, support)
├── tool.html           # Tool detail page (metadata, dependencies, install)
├── css/
│   └── style.css       # Theme, layout, components, responsive rules
└── js/
    ├── packages.js     # Debian Packages file parser (IIFE)
    ├── search.js       # Search input handler with debounce (IIFE)
    └── app.js          # Main app: rendering, copy, menu, scroll (IIFE)
```

## Getting Started

Clone and open locally:

```bash
git clone https://github.com/TermuxVoid/termuxvoid.github.io.git
cd termuxvoid.github.io
# Open index.html in any browser — no server required
```

Or visit the live site: **[termuxvoid.github.io](https://termuxvoid.github.io)**

## Adding the Repository (Termux)

TermuxVoid ships the same tools as both an APT and a Pacman repository. Add the one matching your setup:

```bash
# APT (dpkg) Termux
curl -sL https://github.com/termuxvoid/repo/raw/main/install.sh | bash

# Pacman Termux
curl -sL https://github.com/termuxvoid/pacman-repo/raw/main/install-repo.sh | bash
```

Once added, install any tool with `pkg install` — it works on both APT and Pacman setups:

```bash
# Install any tool
pkg install <tool-name>
```

## Tech Stack

- **HTML5** — semantic markup
- **CSS3** — custom properties, ledger rules and offset sheet shadows, print-run entrance animations
- **Vanilla JS** — IIFE modules, `fetch` API, `Clipboard` API
- **Google Fonts** — Martian Mono (labels, commands, index numbers) + Atkinson Hyperlegible (prose)

## Contributing

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/my-change`)
3. Commit your changes (`git commit -m "Add my change"`)
4. Push to the branch (`git push origin feature/my-change`)
5. Open a Pull Request

## Community

- **Telegram:** [@nullxvoid](https://t.me/nullxvoid)
- **YouTube:** [@alienkrishnorg](https://youtube.com/@alienkrishnorg)
- **Issues:** [GitHub Issues](https://github.com/TermuxVoid/repo/issues)
- **Email:** [termuxvoid@gmail.com](mailto:termuxvoid@gmail.com)

## License

This project is licensed under the [BSD 3-Clause License](https://github.com/TermuxVoid/repo/blob/main/LICENSE).

---

<p align="center">
  Built for the security research community.
</p>
