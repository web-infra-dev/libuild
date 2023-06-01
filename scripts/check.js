const { promisify } = require('util');
const { exec: execOrig, execSync } = require('child_process');

const exec = promisify(execOrig);

function getCurrentBranch() {
  return execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
}

async function main() {
  console.log('Checking for changeset...');

  const GITHUB_HEAD_REF = process.argv[2];

  if (GITHUB_HEAD_REF) {
    console.log(`GITHUB_HEAD_REF is ${GITHUB_HEAD_REF}`);
  }

  const branchName = GITHUB_HEAD_REF || getCurrentBranch();

  if (branchName.startsWith('bump') || branchName.startsWith('release')) {
    console.log('Skipped in current branch: ', branchName);
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
