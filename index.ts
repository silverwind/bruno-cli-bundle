#!/usr/bin/env node
// Replicates @usebruno/cli/src/index.js whose runtime yargs.commandDir() scan breaks bundling

import yargs from "yargs";
import chalk from "chalk";
// @ts-expect-error untyped module
import {CLI_EPILOGUE, CLI_VERSION} from "@usebruno/cli/src/constants";
// @ts-expect-error untyped module
import docsCommand from "@usebruno/cli/src/commands/docs";
// @ts-expect-error untyped module
import importCommand from "@usebruno/cli/src/commands/import";
// @ts-expect-error untyped module
import runCommand from "@usebruno/cli/src/commands/run";
// @ts-expect-error untyped module
import {initializeShellEnv} from "@usebruno/requests";

await initializeShellEnv(); // for when the CLI runs as subprocess of a GUI app or cron

if (process.argv.length <= 2 || process.argv.some((arg) => arg === "--help" || arg === "-h")) {
  console.log(chalk.yellow(`Bru CLI ${CLI_VERSION}`)); // eslint-disable-line no-console -- banner is CLI output
}

yargs(process.argv.slice(2))
  .strict()
  .command(docsCommand)
  .command(importCommand)
  .command(runCommand)
  .epilogue(CLI_EPILOGUE)
  .usage("Usage: $0 <command> [options]")
  .version(CLI_VERSION)
  .demandCommand(1, "Woof!! Let's play with some APIs!!")
  .help("h")
  .alias("h", "help")
  .parse();
