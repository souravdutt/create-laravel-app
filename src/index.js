import chalk from "chalk";
import ora from "ora";
import { setupLaravel } from "./setupLaravel.js";

export async function main(args) {
  const projectName = args[0];
  const spinner = ora("Setting up Laravel environment...").start();

  try {
    await setupLaravel(projectName);
    spinner.succeed(chalk.green(`Laravel project '${projectName}' created successfully!`));
    console.log(`
Next steps:
  cd ${projectName}
  ./bin/php artisan serve

✨ Enjoy coding without needing system PHP or Composer!
    `);
  } catch (err) {
    spinner.fail(chalk.red("Laravel setup failed."));
    console.error(err);
  }
}
