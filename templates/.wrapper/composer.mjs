#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawnSync } from 'child_process';
import { existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..', '..');

// Check if bin/php exists in project root, otherwise check parent
let phpBin = join(projectRoot, 'bin', 'php');
let composerBin = join(projectRoot, 'bin', 'composer.phar');

if (!existsSync(phpBin)) {
  phpBin = join(projectRoot, '..', 'bin', 'php');
  composerBin = join(projectRoot, '..', 'bin', 'composer.phar');
}

// Forward all arguments to Composer
const result = spawnSync(phpBin, [composerBin, ...process.argv.slice(2)], {
  stdio: 'inherit',
  cwd: projectRoot
});

process.exit(result.status || 0);
