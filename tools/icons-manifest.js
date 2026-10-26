#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'assets', 'icons');
const files = fs.readdirSync(dir).filter((name) => /\.(svg|png)$/i.test(name));
const icons = {};

for (const file of files.sort()) {
  const ext = path.extname(file).toLowerCase();
  const name = path.basename(file, ext);
  if (name === 'default' || name.startsWith('cat-')) continue;
  if (!icons[name] || ext === '.svg') icons[name] = file;
}

const out = path.join(dir, 'manifest.js');
fs.writeFileSync(out, 'window.TV_ICONS = ' + JSON.stringify(icons, null, 2) + ';\n');
console.log('Wrote ' + Object.keys(icons).length + ' icon mappings to ' + path.relative(process.cwd(), out));
