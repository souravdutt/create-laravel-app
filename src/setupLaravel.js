#!/usr/bin/env node

/**
 * setupLaravel.js
 * ------------------------------------
 * A one-command Laravel installer that works anywhere using Node.
 * Hybrid mode: Downloads PHP + Composer binaries automatically
 * from your GitHub repo releases.
 */

import os from "os";
import fs from "fs";
import https from "https";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import * as tar from "tar";
import AdmZip from "adm-zip";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---------------- CONFIG ----------------
const RELEASE = "8.4.14"; // 🔢 change when PHP version updates
const BIN_DIR = path.resolve("./bin");
const PHP_BIN = path.join(BIN_DIR, "php");
const COMPOSER_BIN = path.join(BIN_DIR, "composer.phar");
const BASE_URL = `https://github.com/souravdutt/php-binaries/releases/download/${RELEASE}`;
const COMPOSER_URL = "https://github.com/souravdutt/php-binaries/raw/main/composer/2.8.12/composer.phar";

// ---------------- UTILS ----------------
const log = (msg) => console.log(`\x1b[36m${msg}\x1b[0m`);
const error = (msg) => console.error(`\x1b[31m${msg}\x1b[0m`);

function run(cmd, cwd = process.cwd()) {
  execSync(cmd, { stdio: "inherit", cwd });
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// Download file using Node.js https module
async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 302 || response.statusCode === 301) {
        return downloadFile(response.headers.location, dest).then(resolve).catch(reject);
      }
      
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlinkSync(dest);
      reject(err);
    });
  });
}

// ---------------- DETECT OS ----------------
function detectPlatform() {
  const platform = os.platform();
  if (platform === "win32") return { os: "win", ext: "zip" };
  if (platform === "darwin") return { os: "mac", ext: "tar.gz" };
  return { os: "linux", ext: "tar.gz" };
}

// ---------------- DOWNLOAD + EXTRACT ----------------
function getBinaryFilename({ os, ext }) {
  return os === "win" ? "php-win.zip" : `php-${os}.${ext}`;
}

async function setupBinaries() {
  ensureDir(BIN_DIR);
  const { os, ext } = detectPlatform();
  const filename = getBinaryFilename({ os, ext });
  const url = `${BASE_URL}/${filename}`;

  if (!fs.existsSync(PHP_BIN)) {
    log(`⬇️  Downloading PHP binary for ${os}...`);
    const archivePath = path.join(BIN_DIR, filename);
    await downloadFile(url, archivePath);

    log("📦 Extracting PHP binary...");

    if (ext === "zip") {
      // Use adm-zip for Windows
      const zip = new AdmZip(archivePath);
      zip.extractAllTo(BIN_DIR, true);
    } else {
      // Use tar for Unix-like systems
      await tar.x({
        file: archivePath,
        cwd: BIN_DIR,
      });
    }

    // Find PHP binary path
    const phpCandidates = fs
      .readdirSync(BIN_DIR)
      .filter((f) => f.startsWith("php") && !f.endsWith(".gz") && !f.endsWith(".zip"));

    const phpFile = phpCandidates.find((f) =>
      os === "win" ? f.endsWith(".exe") : !f.includes("fpm")
    );
    
    if (!phpFile) {
      error("❌ PHP binary not found after extraction!");
      process.exit(1);
    }
    
    const phpPath = path.join(BIN_DIR, phpFile);
    fs.renameSync(phpPath, PHP_BIN);
    fs.chmodSync(PHP_BIN, 0o755);
  } else {
    log("✅ PHP binaries already exist. Skipping download.\n");
  }

  if (!fs.existsSync(COMPOSER_BIN)) {
    // Download Composer
    log("⬇️  Downloading Composer...");
    await downloadFile(COMPOSER_URL, COMPOSER_BIN);
    fs.chmodSync(COMPOSER_BIN, 0o755);
  } else {
    log("✅ Composer binary already exists. Skipping download.\n");
  }

  log("✅ PHP + Composer ready!\n");
}

// ---------------- CREATE LARAVEL APP ----------------
async function createLaravelApp(appName) {
  if (!appName) {
    error("Usage: npx setup-laravel <app-name>");
    process.exit(1);
  }

  const targetDir = path.resolve(process.cwd(), appName);
  if (fs.existsSync(targetDir)) {
    error("❌ Directory already exists!");
    process.exit(1);
  }

  ensureDir(targetDir);
  log(`🚀 Creating Laravel app: ${appName}`);

  try {
    run(`${PHP_BIN} ${COMPOSER_BIN} create-project laravel/laravel ${targetDir}`);
    log("✅ Laravel project created successfully!");
  } catch (err) {
    error("❌ Installation failed.");
    console.error(err.message);
    process.exit(1);
  }
}

// ---------------- EXPORTED FUNCTION ----------------
export async function setupLaravel(appName) {
  log("\n⚙️  Setting up Laravel installer...");

  await setupBinaries();
  await verifyPHP();
  await createLaravelApp(appName);

  // Return paths for further setup
  return {
    projectPath: path.resolve(process.cwd(), appName),
    phpBin: PHP_BIN,
    composerBin: COMPOSER_BIN,
  };
}

// ---------------- VERIFY PHP ----------------
async function verifyPHP() {
  try {
    run(`${PHP_BIN} -v`);
  } catch {
    error("❌ PHP runtime test failed. Check downloaded binary.");
    process.exit(1);
  }

  try {
    run(`${PHP_BIN} ${COMPOSER_BIN} -V`);
  } catch {
    error("❌ Composer test failed. Check downloaded binary.");
    process.exit(1);
  }
}

// ---------------- MAIN EXECUTION ----------------
async function main() {
  const appName = process.argv[2];
  await setupLaravel(appName);

  log(`
✨ All done! Your Laravel app '${appName}' is ready.

👉 Next steps:
   cd ${appName}
   ../bin/php artisan serve

(No system PHP or Composer required 🎉)
`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
