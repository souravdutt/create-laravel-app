// src/utils.js
import fs from "fs";
import { execSync } from "child_process";
import chalk from "chalk";

export function log(msg) {
  console.log(chalk.cyan(msg));
}

export function error(msg) {
  console.error(chalk.red(msg));
}

export function run(cmd, cwd = process.cwd()) {
  execSync(cmd, { stdio: "inherit", cwd });
}

export function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}
