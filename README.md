<p align="center">
  <img src="https://termuxvoid.github.io/repo/img/termuxvoid_logo.png" alt="TermuxVoid" width="100">
</p>

<h1 align="center">TermuxVoid Website</h1>

<p align="center">
  Official landing page for the TermuxVoid APT Repository — advanced security tools for Termux.
</p>

<p align="center">
  <a href="https://termuxvoid.github.io"><img src="https://img.shields.io/badge/Site-Live-00ff41?style=for-the-badge&logo=googlechrome&logoColor=000" alt="Live Site"></a>
  <a href="https://github.com/TermuxVoid/repo/stargazers"><img src="https://img.shields.io/github/stars/TermuxVoid/repo?style=for-the-badge&logo=github&color=00ff41&labelColor=0a0a0a" alt="Stars"></a>
  <a href="https://github.com/TermuxVoid/repo/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-BSD_3--Clause-00ff41?style=for-the-badge&logo=opensourceinitiative&logoColor=000" alt="License"></a>
  <a href="https://t.me/nullxvoid"><img src="https://img.shields.io/badge/Telegram-Join-00ff41?style=for-the-badge&logo=telegram&logoColor=000" alt="Telegram"></a>
</p>

---

## Overview

A neon hacker-themed single-page site built with vanilla HTML, CSS, and JavaScript. It fetches package metadata directly from the TermuxVoid APT repository and lets users browse, search, and get install commands for 100+ security tools — no frameworks, no build step.

## Features

| Feature | Description |
|---|---|
| **Live Search** | Fuzzy search across tool names, descriptions, and categories via the remote `Packages` index |
| **Tool Detail Pages** | Dedicated pages with version, dependencies, SHA256 checksums, and one-click copy |
| **Responsive** | Fully responsive layout with mobile hamburger menu |
| **Zero Dependencies** | Pure HTML/CSS/JS — no bundler, no framework, no npm |
| **Copy to Clipboard** | One-tap copy for install commands and checksums |
| **Keyboard Shortcuts** | Press `/` to focus search, `Esc` to dismiss |

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

```bash
# Add the TermuxVoid repository
curl -sL https://termuxvoid.github.io/repo/install.sh | bash

# Install any tool
pkg install <tool-name>
```

## Tech Stack

- **HTML5** — semantic markup
- **CSS3** — custom properties, neon glow effects, grid/flexbox, animations
- **Vanilla JS** — IIFE modules, `fetch` API, `Clipboard` API
- **Google Fonts** — Inter (400–800)

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
