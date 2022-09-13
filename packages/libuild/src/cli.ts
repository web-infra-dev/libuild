import * as Clipanion from 'clipanion';
import chalk from 'chalk';
import { catchUnhandledReject } from '@modern-js/libuild-utils';
import { Libuilder } from './core';

export async function run(args = process.argv.slice(2)) {
  const cli = new Clipanion.Cli({
    binaryLabel: 'libuild scripts',
    binaryName: 'script',
    binaryVersion: require('../package.json').version,
  });
  cli.error = (error) => error.toString();
  cli.register(BuildCommand);
  cli.register(Clipanion.Builtins.VersionCommand);

  const exitCode = await catchUnhandledReject(cli.run(args), (err) => {
    console.log(err);
    process.exit(1);
  });
  if (exitCode) {
    process.exit(exitCode);
  }
}

export class BuildCommand extends Clipanion.Command {
  root = Clipanion.Option.String('--root', { required: false });

  config = Clipanion.Option.String('-c,--config', { required: false });

  watch = Clipanion.Option.Boolean('-w,--watch', { required: false });

  bundle = Clipanion.Option.Boolean('--bundle');

  sourceMap = Clipanion.Option.Boolean('--sourcemap');

  async execute() {
    const start = Date.now();
    const { root, watch, config, bundle, sourceMap } = this;
    await Libuilder.run({
      root,
      configFile: config,
      watch,
      bundle,
      sourceMap,
    });
    const end = Date.now() - start;
    console.info(chalk.green(`Build completed in ${end}ms`));
  }
}
