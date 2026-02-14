#!/usr/bin/env node
// Replicates @usebruno/cli/src/index.js because the upstream uses
// yargs.commandDir() which relies on runtime filesystem scanning
// and is incompatible with bundling.

import yargs from "yargs";
import chalk from "chalk";
// @ts-expect-error untyped module
import {CLI_EPILOGUE, CLI_VERSION} from "@usebruno/cli/src/constants";
// @ts-expect-error untyped module
import runCommand from "@usebruno/cli/src/commands/run";
// @ts-expect-error untyped module
import importCommand from "@usebruno/cli/src/commands/import";

const printBanner = () => {
  console.log(chalk.yellow(`Bru CLI ${CLI_VERSION}`)); // eslint-disable-line no-console
};

const run = () => {
  const commandsToPrintBanner = ["--help", "-h"];

  if (process.argv.length <= 2 || process.argv.some((arg) => commandsToPrintBanner.includes(arg))) {
    printBanner();
  }

  yargs(process.argv.slice(2))
    .strict()
    .command(runCommand)
    .command(importCommand)
    .epilogue(CLI_EPILOGUE)
    .usage("Usage: $0 <command> [options]")
    .demandCommand(1, "Woof!! Let's play with some APIs!!")
    .help("h")
    .alias("h", "help")
    .parse();
};

run();
