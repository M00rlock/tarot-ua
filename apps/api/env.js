const { existsSync, readFileSync } = require('node:fs');
const { resolve } = require('node:path');

const candidates = [
  resolve(__dirname, '.env'),
  resolve(process.cwd(), '.env'),
];

for (const file of candidates) {
  if (!existsSync(file)) continue;

  const lines = readFileSync(file, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const separator = trimmed.indexOf('=');
    if (separator === -1) continue;

    const key = trimmed.slice(0, separator).trim();
    const rawValue = trimmed.slice(separator + 1).trim();
    const value = rawValue.replace(/^['"]|['"]$/g, '');

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}
