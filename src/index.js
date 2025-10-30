import chalk from "chalk";
import ora from "ora";
import path from "path";
import fs from "fs-extra";
import { fileURLToPath } from "url";
import { setupLaravel } from "./setupLaravel.js";
import { setupTypeSafety } from "./typeSafetySetup.js";
import { execa } from "execa";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = path.resolve(__dirname, "../templates");

async function setupBasicReact(projectPath) {
  // Add npm scripts for non-typesafe React mode
  const packageJsonPath = path.join(projectPath, "package.json");
  const packageJson = await fs.readJson(packageJsonPath);

  packageJson.dependencies = packageJson.dependencies || {};
  packageJson.devDependencies = packageJson.devDependencies || {};

  // Add React dependencies (no TypeScript)
  packageJson.dependencies.react = "^18.2.0";
  packageJson.dependencies["react-dom"] = "^18.2.0";
  packageJson.devDependencies["@vitejs/plugin-react"] = "^4.0.0";
  packageJson.devDependencies.tailwindcss = "^3.4.17";
  packageJson.devDependencies.autoprefixer = "^10.4.20";
  packageJson.devDependencies.postcss = "^8.4.49";

  packageJson.scripts = packageJson.scripts || {};
  packageJson.scripts["dev"] = "php artisan serve & vite";
  packageJson.scripts["serve"] = "php artisan serve";
  packageJson.scripts["migrate"] = "php artisan migrate";

  await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });

  // Copy Vite config and update for JSX
  const viteConfigContent = `import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        react(),
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            refresh: true,
        }),
    ],
});
`;
  await fs.writeFile(path.join(projectPath, "vite.config.js"), viteConfigContent);

  // Copy Tailwind config and update for JSX
  const tailwindConfigContent = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./resources/**/*.blade.php",
    "./resources/**/*.js",
    "./resources/**/*.jsx",
    "./resources/**/*.vue",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
`;
  await fs.writeFile(path.join(projectPath, "tailwind.config.js"), tailwindConfigContent);
  
  // Copy PostCSS config
  await fs.copy(
    path.join(TEMPLATES_DIR, "postcss.config.js"),
    path.join(projectPath, "postcss.config.js")
  );

  // Create JS directories
  const jsApiDir = path.join(projectPath, "resources/js/api");
  const jsComponentsDir = path.join(projectPath, "resources/js/components");
  await fs.ensureDir(jsApiDir);
  await fs.ensureDir(jsComponentsDir);

  // Copy JavaScript files (not TypeScript)
  await fs.copy(
    path.join(TEMPLATES_DIR, "resources/js/api/client.js"),
    path.join(jsApiDir, "client.js")
  );

  await fs.copy(
    path.join(TEMPLATES_DIR, "resources/js/components/App.jsx"),
    path.join(jsComponentsDir, "App.jsx")
  );

  await fs.copy(
    path.join(TEMPLATES_DIR, "resources/js/app.jsx"),
    path.join(projectPath, "resources/js/app.jsx")
  );

  // Copy CSS file
  const cssDir = path.join(projectPath, "resources/css");
  await fs.ensureDir(cssDir);
  await fs.copy(
    path.join(TEMPLATES_DIR, "resources/css/app.css"),
    path.join(cssDir, "app.css")
  );

  // Copy views (update welcome.blade.php to use app.jsx instead of app.tsx)
  const welcomeContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>S6 Stack</title>
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
</head>
<body class="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
    <div id="app"></div>
</body>
</html>
`;
  
  const viewsDir = path.join(projectPath, "resources/views");
  await fs.writeFile(path.join(viewsDir, "welcome.blade.php"), welcomeContent);

  // Copy backend files (Controller, Model, Migration, Routes)
  const controllersDir = path.join(projectPath, "app/Http/Controllers");
  await fs.copy(
    path.join(TEMPLATES_DIR, "app/Http/Controllers/NoteController.php"),
    path.join(controllersDir, "NoteController.php")
  );

  const modelsDir = path.join(projectPath, "app/Models");
  await fs.copy(
    path.join(TEMPLATES_DIR, "app/Models/Note.php"),
    path.join(modelsDir, "Note.php")
  );

  const migrationsDir = path.join(projectPath, "database/migrations");
  await fs.copy(
    path.join(TEMPLATES_DIR, "database/migrations/2025_10_29_000000_create_notes_table.php"),
    path.join(migrationsDir, "2025_10_29_000000_create_notes_table.php")
  );

  // Add API routes
  const apiRoutesPath = path.join(projectPath, "routes/api.php");
  if (!(await fs.pathExists(apiRoutesPath))) {
    const apiRoutesContent = `<?php

use App\\Http\\Controllers\\NoteController;
use Illuminate\\Support\\Facades\\Route;

Route::get('/notes', [NoteController::class, 'index']);
Route::post('/notes', [NoteController::class, 'store']);
Route::put('/notes/{id}', [NoteController::class, 'update']);
Route::delete('/notes/{id}', [NoteController::class, 'destroy']);
`;
    
    await fs.writeFile(apiRoutesPath, apiRoutesContent);
  }

  // Enable API routes in bootstrap/app.php
  const bootstrapPath = path.join(projectPath, "bootstrap/app.php");
  if (await fs.pathExists(bootstrapPath)) {
    let content = await fs.readFile(bootstrapPath, "utf-8");
    
    if (!content.includes("api: __DIR__")) {
      content = content.replace(
        /->withRouting\(\s*web: __DIR__\.'\/\.\.\/routes\/web\.php',/,
        `->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',`
      );
      
      await fs.writeFile(bootstrapPath, content);
    }
  }
}

export async function main(args) {
  // Parse arguments
  const projectName = args.find(arg => !arg.startsWith('--'));
  // Type safety is now DEFAULT - users can opt-out with --no-typesafe
  const skipTypeSafety = args.includes('--no-typesafe') || args.includes('--skip-typesafe');
  const withTypeSafety = !skipTypeSafety;
  const ciMode = args.includes('--ci');
  
  if (!projectName) {
    console.log(chalk.red("Error: Please provide a project name"));
    console.log(chalk.yellow("\nUsage:"));
    console.log("  npx create-s6-app <project-name> [options]");
    console.log("\nOptions:");
    console.log("  --no-typesafe      Skip hybrid type safety setup (not recommended)");
    console.log("  --ci               Skip dev server (for CI/CD testing)");
    process.exit(1);
  }

  try {
    const { projectPath, phpBin, composerBin } = await setupLaravel(projectName);

    // Setup type safety if requested, otherwise setup basic React
    if (withTypeSafety) {
      await setupTypeSafety(projectPath, phpBin, composerBin);
    } else {
      const reactSpinner = ora("Setting up React with JavaScript...").start();
      await setupBasicReact(projectPath);
      reactSpinner.succeed(chalk.green("React setup complete!"));
    }

      console.log(chalk.cyan("\n✨ Setup complete!\n"));
      
      if (ciMode) {
        console.log(chalk.yellow("CI Mode: Skipping dependencies, migrations, and dev server\n"));
        console.log(chalk.green("✓ Project created successfully for CI/CD testing"));
        console.log(chalk.gray(`\nTo run locally: cd ${projectName} && npm install && npm run migrate && npm run dev\n`));
      } else {
        console.log(chalk.yellow("Next steps:\n"));
        console.log(`  cd ${projectName}`);
        await execa("npm", ["install"], { cwd: projectPath, stdio: "inherit" });

        if (withTypeSafety) {
          console.log("  Generating types:");
          // run command here:
          await execa("npm", ["run", "gen:types"], { cwd: projectPath, stdio: "inherit" });
          console.log("  Running migrations:");
          await execa("npm", ["run", "migrate"], { cwd: projectPath, stdio: "inherit" });
          console.log("  Running dev server:");
          await execa("npm", ["run", "dev"], { cwd: projectPath, stdio: "inherit" });
          console.log(chalk.gray("\n💡 Type safety enabled by default. Use --no-typesafe to skip.\n"));
        } else {
          console.log("  Running migrations:");
          await execa("npm", ["run", "migrate"], { cwd: projectPath, stdio: "inherit" });
          console.log("  Running dev server:");
          await execa("npm", ["run", "dev"], { cwd: projectPath, stdio: "inherit" });
          console.log(chalk.gray("\n💡 JavaScript mode (no TypeScript). Remove --no-typesafe for full type safety.\n"));
        }
      }


  } catch (err) {
    console.error(chalk.red("✗ Setup failed."));
    console.error(err);
    process.exit(1);
  }
}
