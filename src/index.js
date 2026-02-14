#!/usr/bin/env node

const yargs = require("yargs");
const chalk = require("chalk");
const {CLI_EPILOGUE, CLI_VERSION} = require("@usebruno/cli/src/constants");
const runCommand = require("@usebruno/cli/src/commands/run");
const importCommand = require("@usebruno/cli/src/commands/import");

const printBanner = () => {
  console.log(chalk.yellow(`Bru CLI ${CLI_VERSION}`));
};

const run = async () => {
  const argLength = process.argv.length;
  const commandsToPrintBanner = ["--help", "-h"];

  if (argLength <= 2 || process.argv.find((arg) => commandsToPrintBanner.includes(arg))) {
    printBanner();
  }

  const {argv} = yargs
    .strict()
    .command(runCommand)
    .command(importCommand)
    .epilogue(CLI_EPILOGUE)
    .usage("Usage: $0 <command> [options]")
    .demandCommand(1, "Woof!! Let's play with some APIs!!")
    .help("h")
    .alias("h", "help");
};

run();
