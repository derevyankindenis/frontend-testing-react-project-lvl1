#!/usr/bin/env node
/* eslint-disable no-console */
import { cwd, argv } from 'process';
import { Command } from 'commander';
import pageLoader from '../src/pageLoader';

const program = new Command();

program
  .description('Utility to download and save web page')
  .arguments('<url>')
  .option('-o, --output [path]', 'Path to save page', cwd())
  .version('0.1.0')
  .action(async (url, options) => {
    console.log(`Downloading ${url} ...`);
    const { filepath } = await pageLoader(url, options.output);
    console.log('Done');
    console.log(filepath);
  })
  .parse(argv);
