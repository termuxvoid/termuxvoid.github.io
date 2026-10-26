const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'packages.js'), 'utf8');
const sandbox = { sessionStorage: { getItem() { return null; }, setItem() {} } };
vm.runInNewContext(`${source}\nglobalThis.PackagesParser = PackagesParser;`, sandbox);
const { parse } = sandbox.PackagesParser;

test('parses fields and folded descriptions', () => {
  const [pkg] = parse([
    'Package: sqlmap',
    'Version: 1.8',
    'Architecture: all',
    'Description: automatic SQL injection',
    ' and database takeover tool',
    'Section: security',
    'Homepage: https://sqlmap.org',
    'Size: 1234',
  ].join('\n'));
  assert.equal(pkg.name, 'sqlmap');
  assert.equal(pkg.description, 'automatic SQL injection and database takeover tool');
  assert.equal(pkg.section, 'security');
  assert.equal(pkg.size, '1234');
});

test('handles Windows line endings', () => {
  const [pkg] = parse('Package: nmap\r\nVersion: 7\r\nDescription: scanner\r\n\r\nPackage: curl\r\nVersion: 8\r\n');
  assert.equal(pkg.name, 'nmap');
  assert.equal(pkg.description, 'scanner');
  assert.equal(parse('Package: nmap\r\n\r\nPackage: curl\r\n').length, 2);
});

test('skips blocks without a Package field', () => {
  const parsed = parse('Version: 1\n\nPackage: ok\nVersion: 2');
  assert.equal(parsed.length, 1);
  assert.equal(parsed[0].name, 'ok');
  assert.equal(parsed[0].version, '2');
  assert.equal(parsed[0].section, 'other');
});
