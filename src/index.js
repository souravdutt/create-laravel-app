import chalk from "chalk";
import ora from "ora";
import path from "path";
import { setupLaravel } from "./setupLaravel.js";
import { setupTypeSafety } from "./typeSafetySetup.js";

export async function main(args) {
  // Parse arguments
  const projectName = args.find(arg => !arg.startsWith('--'));
  // Type safety is now DEFAULT - users can opt-out with --no-typesafe
  const skipTypeSafety = args.includes('--no-typesafe') || args.includes('--skip-typesafe');
  const withTypeSafety = !skipTypeSafety;
  
  if (!projectName) {
    console.log(chalk.red("Error: Please provide a project name"));
    console.log(chalk.yellow("\nUsage:"));
    console.log("  npx create-s6-app <project-name> [options]");
    console.log("\nOptions:");
    console.log("  --no-typesafe      Skip hybrid type safety setup (not recommended)");
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
      console.log(chalk.gray("\n💡 Type safety enabled by default. Use --no-typesafe to skip.\n"));
    } else {
      console.log("  npx artisan serve");
      console.log(chalk.gray("\n💡 Type safety skipped. Remove --no-typesafe for full features.\n"));
    }

  } catch (err) {
    spinner.fail(chalk.red("Setup failed."));
    console.error(err);
    process.exit(1);
  }
}
