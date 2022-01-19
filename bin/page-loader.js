#!/usr/bin/env node
/* eslint-disable no-console */
import { cwd, argv } from 'process';
import { Command } from 'commander';
import debug from 'debug';
import pageLoader from '../index';

const log = debug('page-loader');

const program = new Command();

program
  .description('Utility to download and save web page')
  .arguments('<url>')
  .option('-o, --output [path]', 'Path to save page', cwd())
  .version('0.1.0')
  .action(async (url, options) => {
    log(`Downloading ${url} ...`);
    try {
      const { filepath } = await pageLoader(url, options.output);
      console.log('\x1b[32m', 'Page has been loaded');
      console.log('\x1b[32m', filepath);
    } catch (exeption) {
      console.error('\x1b[31m', 'ERROR!', exeption.message);
      process.exit(1);
    }
  })
  .parse(argv);
