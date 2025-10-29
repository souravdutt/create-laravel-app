#!/usr/bin/env node

import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import chalk from "chalk";
import ora from "ora";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = path.resolve(__dirname, "../templates");

/**
 * Setup type safety for Laravel project
 */
export async function setupTypeSafety(projectPath, phpBin, composerBin) {
  const spinner = ora("Setting up type safety system...").start();

  try {
    // 1. Install PHP dependencies
    spinner.text = "Installing PHP packages...";
    await installPhpPackages(projectPath, phpBin, composerBin);

    // 2. Copy template files
    spinner.text = "Copying template files...";
    await copyTemplateFiles(projectPath);

    // 3. Install Node dependencies
    spinner.text = "Installing Node.js packages...";
    await installNodePackages(projectPath);

    // 4. Update configuration files
    spinner.text = "Updating configuration...";
    await updateConfigurations(projectPath);

    // 5. Add routes
    spinner.text = "Adding API routes...";
    await addApiRoutes(projectPath);

    // 6. Register commands
    spinner.text = "Registering Artisan commands...";
    await registerCommands(projectPath);

    spinner.succeed(chalk.green("Type safety system setup complete!"));

    console.log(chalk.cyan("\n✨ Type safety features enabled:\n"));
    console.log("  • PHP DTOs → TypeScript interfaces");
    console.log("  • Auto-generated Zod schemas");
    console.log("  • Type-safe API client");
    console.log("  • Watch mode for auto-regeneration\n");

    console.log(chalk.yellow("📝 Next steps:\n"));
    console.log("  1. Run type generation:");
    console.log(chalk.gray("     php artisan typescript:transform"));
    console.log(chalk.gray("     php artisan gen:zod-schemas"));
    console.log(chalk.gray("     php artisan gen:ts-client\n"));
    console.log("  2. Start watch mode (optional):");
    console.log(chalk.gray("     php artisan typescript:watch\n"));
    console.log("  3. Start dev server:");
    console.log(chalk.gray("     npm run dev\n"));

  } catch (error) {
    spinner.fail(chalk.red("Type safety setup failed"));
    throw error;
  }
}

async function installPhpPackages(projectPath, phpBin, composerBin) {
  const { execa } = await import("execa");
  
  const packages = [
    "spatie/laravel-typescript-transformer",
  ];

  for (const pkg of packages) {
    await execa(phpBin, [composerBin, "require", pkg, "--working-dir=" + projectPath], {
      stdio: "inherit",
    });
  }
}

async function copyTemplateFiles(projectPath) {
  // Copy DTO examples
  const dtoDir = path.join(projectPath, "app/DTO");
  await fs.ensureDir(dtoDir);
  await fs.copy(
    path.join(TEMPLATES_DIR, "app/DTO/UserDto.php"),
    path.join(dtoDir, "UserDto.php")
  );
  await fs.copy(
    path.join(TEMPLATES_DIR, "app/DTO/NoteDto.php"),
    path.join(dtoDir, "NoteDto.php")
  );

  // Copy Console Commands
  const commandsDir = path.join(projectPath, "app/Console/Commands");
  await fs.ensureDir(commandsDir);
  
  const commands = [
    "GenerateTypescriptClient.php",
    "GenerateZodSchemas.php",
    "TypeScriptWatch.php",
  ];

  for (const cmd of commands) {
    await fs.copy(
      path.join(TEMPLATES_DIR, "app/Console/Commands", cmd),
      path.join(commandsDir, cmd)
    );
  }

  // Copy Controller examples
  const controllersDir = path.join(projectPath, "app/Http/Controllers");
  await fs.copy(
    path.join(TEMPLATES_DIR, "app/Http/Controllers/UserController.php"),
    path.join(controllersDir, "UserController.php")
  );
  await fs.copy(
    path.join(TEMPLATES_DIR, "app/Http/Controllers/NoteController.php"),
    path.join(controllersDir, "NoteController.php")
  );

  // Copy Model
  const modelsDir = path.join(projectPath, "app/Models");
  await fs.copy(
    path.join(TEMPLATES_DIR, "app/Models/Note.php"),
    path.join(modelsDir, "Note.php")
  );

  // Copy migration
  const migrationsDir = path.join(projectPath, "database/migrations");
  await fs.copy(
    path.join(TEMPLATES_DIR, "database/migrations/2025_10_29_000000_create_notes_table.php"),
    path.join(migrationsDir, "2025_10_29_000000_create_notes_table.php")
  );

  // Copy wrapper scripts for artisan and composer
  const wrapperSrcDir = path.join(TEMPLATES_DIR, ".wrapper");
  const nodeModulesBinDir = path.join(projectPath, "node_modules/.bin");
  await fs.ensureDir(nodeModulesBinDir);
  
  await fs.copy(
    path.join(wrapperSrcDir, "artisan.mjs"),
    path.join(nodeModulesBinDir, "artisan")
  );
  await fs.chmod(path.join(nodeModulesBinDir, "artisan"), 0o755);
  
  await fs.copy(
    path.join(wrapperSrcDir, "composer.mjs"),
    path.join(nodeModulesBinDir, "composer")
  );
  await fs.chmod(path.join(nodeModulesBinDir, "composer"), 0o755);

  // Copy TypeScript config
  await fs.copy(
    path.join(TEMPLATES_DIR, "tsconfig.json"),
    path.join(projectPath, "tsconfig.json")
  );

  // Copy Vite config (update existing)
  await fs.copy(
    path.join(TEMPLATES_DIR, "vite.config.js"),
    path.join(projectPath, "vite.config.js")
  );

  // Copy Tailwind & PostCSS configs
  await fs.copy(
    path.join(TEMPLATES_DIR, "tailwind.config.js"),
    path.join(projectPath, "tailwind.config.js")
  );
  
  await fs.copy(
    path.join(TEMPLATES_DIR, "postcss.config.js"),
    path.join(projectPath, "postcss.config.js")
  );

  // Create JS directories
  const jsTypesDir = path.join(projectPath, "resources/js/types");
  const jsApiDir = path.join(projectPath, "resources/js/api");
  const jsComponentsDir = path.join(projectPath, "resources/js/components");
  await fs.ensureDir(jsTypesDir);
  await fs.ensureDir(jsApiDir);
  await fs.ensureDir(jsComponentsDir);

  // Copy index file
  await fs.copy(
    path.join(TEMPLATES_DIR, "resources/js/types/index.ts"),
    path.join(jsTypesDir, "index.ts")
  );

  // Copy API client
  await fs.copy(
    path.join(TEMPLATES_DIR, "resources/js/api/client.ts"),
    path.join(jsApiDir, "client.ts")
  );

  // Copy App component (React)
  await fs.copy(
    path.join(TEMPLATES_DIR, "resources/js/components/App.tsx"),
    path.join(jsComponentsDir, "App.tsx")
  );

  // Copy React entry (app.tsx)
  const appTsxPath = path.join(projectPath, "resources/js/app.tsx");
  await fs.copy(
    path.join(TEMPLATES_DIR, "resources/js/app.tsx"),
    appTsxPath
  );

  // Copy CSS file
  const cssDir = path.join(projectPath, "resources/css");
  await fs.ensureDir(cssDir);
  await fs.copy(
    path.join(TEMPLATES_DIR, "resources/css/app.css"),
    path.join(cssDir, "app.css")
  );

  // Copy views
  const viewsDir = path.join(projectPath, "resources/views");
  await fs.copy(
    path.join(TEMPLATES_DIR, "resources/views/welcome.blade.php"),
    path.join(viewsDir, "welcome.blade.php")
  );

  // Copy typescript-transformer config
  const configDir = path.join(projectPath, "config");
  await fs.copy(
    path.join(TEMPLATES_DIR, "config/typescript-transformer.php"),
    path.join(configDir, "typescript-transformer.php")
  );

  // Copy documentation
  await fs.copy(
    path.join(TEMPLATES_DIR, "TYPE_SAFETY.md"),
    path.join(projectPath, "TYPE_SAFETY.md")
  );

  // Add .gitignore entries
  const gitignorePath = path.join(projectPath, ".gitignore");
  const gitignoreAdditions = await fs.readFile(
    path.join(TEMPLATES_DIR, ".gitignore.typesafe"),
    "utf-8"
  );
  
  if (await fs.pathExists(gitignorePath)) {
    const existingGitignore = await fs.readFile(gitignorePath, "utf-8");
    if (!existingGitignore.includes("Type Safety Generated Files")) {
      await fs.appendFile(gitignorePath, "\n" + gitignoreAdditions);
    }
  }

  // Create .gitkeep files
  await fs.writeFile(path.join(projectPath, "resources/js/types/.gitkeep"), "");
  await fs.writeFile(path.join(projectPath, "resources/js/api/.gitkeep"), "");
}

async function installNodePackages(projectPath) {
  const { execa } = await import("execa");
  
  // Read existing package.json
  const packageJsonPath = path.join(projectPath, "package.json");
  const packageJson = await fs.readJson(packageJsonPath);

  // Add dependencies
  packageJson.dependencies = packageJson.dependencies || {};
  packageJson.devDependencies = packageJson.devDependencies || {};

  packageJson.dependencies.zod = "^3.23.8";
  packageJson.dependencies.react = "^18.2.0";
  packageJson.dependencies["react-dom"] = "^18.2.0";
  packageJson.devDependencies.typescript = "^5.7.2";
  packageJson.devDependencies["@types/node"] = "^22.10.1";
  packageJson.devDependencies.tailwindcss = "^3.4.17";
  packageJson.devDependencies.autoprefixer = "^10.4.20";
  packageJson.devDependencies.postcss = "^8.4.49";
  packageJson.devDependencies["@types/react"] = "^18.2.21";
  packageJson.devDependencies["@types/react-dom"] = "^18.2.8";
  packageJson.devDependencies["@vitejs/plugin-react"] = "^4.0.0";

  // Add scripts
  packageJson.scripts = packageJson.scripts || {};
  packageJson.scripts["dev"] = "artisan serve & vite";
  packageJson.scripts["serve"] = "artisan serve";
  packageJson.scripts["migrate"] = "artisan migrate";
  packageJson.scripts["type-check"] = "tsc --noEmit";
  packageJson.scripts["gen:types"] = "composer gen:types";
  packageJson.scripts["watch:types"] = "artisan typescript:watch";

  await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });

  // Install packages
  await execa("npm", ["install"], {
    cwd: projectPath,
    stdio: "inherit",
  });
}

async function updateConfigurations(projectPath) {
  // Add composer scripts for type generation
  const composerJsonPath = path.join(projectPath, "composer.json");
  const composerJson = await fs.readJson(composerJsonPath);
  
  composerJson.scripts = composerJson.scripts || {};
  composerJson.scripts["gen:types"] = [
    "@php artisan typescript:transform",
    "@php artisan gen:zod-schemas",
    "@php artisan gen:ts-client"
  ];
  
  await fs.writeJson(composerJsonPath, composerJson, { spaces: 4 });
}

async function addApiRoutes(projectPath) {
  // Laravel 12 uses bootstrap/app.php for route configuration
  const bootstrapPath = path.join(projectPath, "bootstrap/app.php");
  
  if (await fs.pathExists(bootstrapPath)) {
    let content = await fs.readFile(bootstrapPath, "utf-8");
    
    // Check if api routing already exists
    if (!content.includes("api: __DIR__")) {
      // Add api routing to withRouting
      content = content.replace(
        /->withRouting\(\s*web: __DIR__\.'\/\.\.\/routes\/web\.php',/,
        `->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',`
      );
      
      await fs.writeFile(bootstrapPath, content);
    }
  }
  
  // Create api.php routes file
  const apiRoutesPath = path.join(projectPath, "routes/api.php");
  
  if (!(await fs.pathExists(apiRoutesPath))) {
    const apiRoutesContent = `<?php

use App\\Http\\Controllers\\UserController;
use App\\Http\\Controllers\\NoteController;
use Illuminate\\Support\\Facades\\Route;

Route::get('/users', [UserController::class, 'index']);
Route::get('/users/{id}', [UserController::class, 'show']);

Route::get('/notes', [NoteController::class, 'index']);
Route::post('/notes', [NoteController::class, 'store']);
Route::put('/notes/{id}', [NoteController::class, 'update']);
Route::delete('/notes/{id}', [NoteController::class, 'destroy']);
`;
    
    await fs.writeFile(apiRoutesPath, apiRoutesContent);
  }
}

async function registerCommands(projectPath) {
  const kernelPath = path.join(projectPath, "app/Console/Kernel.php");
  
  if (await fs.pathExists(kernelPath)) {
    let content = await fs.readFile(kernelPath, "utf-8");
    
    // Check if commands are already registered
    if (!content.includes("GenerateTypescriptClient")) {
      const commandsToAdd = `
        \\App\\Console\\Commands\\GenerateTypescriptClient::class,
        \\App\\Console\\Commands\\GenerateZodSchemas::class,
        \\App\\Console\\Commands\\TypeScriptWatch::class,
`;
      
      // Find the $commands array and add our commands
      if (content.includes("protected $commands = [")) {
        content = content.replace(
          "protected $commands = [",
          `protected $commands = [${commandsToAdd}`
        );
      } else {
        // If $commands doesn't exist, add it
        const classMatch = content.match(/class Kernel extends ConsoleKernel\s*{/);
        if (classMatch) {
          content = content.replace(
            classMatch[0],
            `${classMatch[0]}
    protected $commands = [${commandsToAdd}
    ];`
          );
        }
      }
      
      await fs.writeFile(kernelPath, content);
    }
  }
}
