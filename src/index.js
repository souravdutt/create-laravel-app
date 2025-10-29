import chalk from "chalk";
import ora from "ora";
import path from "path";
import { setupLaravel } from "./setupLaravel.js";
import { setupTypeSafety } from "./typeSafetySetup.js";

export async function main(args) {
  // Parse arguments
  const projectName = args.find(arg => !arg.startsWith('--'));
  const withTypeSafety = args.includes('--with-typesafe') || args.includes('--typesafe');
  
  if (!projectName) {
    console.log(chalk.red("Error: Please provide a project name"));
    console.log(chalk.yellow("\nUsage:"));
    console.log("  npx create-s6-app <project-name> [options]");
    console.log("\nOptions:");
    console.log("  --with-typesafe    Enable hybrid type safety (PHP ↔ TypeScript)");
    process.exit(1);
  }

  const spinner = ora("Setting up Laravel environment...").start();

  try {
    const { projectPath, phpBin, composerBin } = await setupLaravel(projectName);
    spinner.succeed(chalk.green(`Laravel project '${projectName}' created successfully!`));

    // Setup type safety if requested
    if (withTypeSafety) {
      await setupTypeSafety(projectPath, phpBin, composerBin);
    }

    console.log(chalk.cyan("\n✨ Setup complete!\n"));
    console.log(chalk.yellow("Next steps:\n"));
    console.log(`  cd ${projectName}`);
    
    if (withTypeSafety) {
      console.log("  npm run gen:types");
      console.log("  npm run dev");
    } else {
      console.log("  ../bin/php artisan serve");
    }
    
    console.log(chalk.gray("\n💡 Tip: Run with --with-typesafe for hybrid type safety\n"));

  } catch (err) {
    spinner.fail(chalk.red("Setup failed."));
    console.error(err);
    process.exit(1);
  }
}
