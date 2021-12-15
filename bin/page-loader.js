#!/usr/bin/env node
/* eslint-disable no-console */
import { cwd, argv } from 'process';
import { Command } from 'commander';
import debug from 'debug';
import pageLoader from '../src/pageLoader';

const log = debug('page-loader');

const program = new Command();

program
  .description('Utility to download and save web page')
  .arguments('<url>')
  .option('-o, --output [path]', 'Path to save page', cwd())
  .version('0.1.0')
  .action(async (url, options) => {
    log(`Downloading ${url} ...`);
    const { filepath } = await pageLoader(url, options.output);
    log('Done');
    log(filepath);
  })
  .parse(argv);
