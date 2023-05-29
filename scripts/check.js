const { promisify } = require('util');
const { exec: execOrig } = require('child_process');

const exec = promisify(execOrig);

async function main() {
  console.log('Checking for changeset...');
  console.log(`GITHUB_HEAD_REF is ${process.argv}`);
  if (process.argv[2].startsWith('bump') || process.argv[2].startsWith('release')) {
    return;
  }
  const { stdout } = await exec('rush change -v');
  console.log(stdout);
}

main().catch((err) => {
  console.error('Failed to detect doc changes', err);
  // eslint-disable-next-line no-process-exit
  process.exit(1);
});
