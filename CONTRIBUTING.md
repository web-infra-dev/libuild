
# Contribution Guide

## Monorepo init
Libuild uses [monorepo](https://monorepo.tools/) to manage the project, and we use [Rush](https://rushjs.io/) for monorepo management.
First we need to install rush globally
```bash
# Install rush
npm i -g @microsoft/rush@5.66.2
```
Then we can use rush to initialize the entire monorepo project.

```bash
#  Install monorepo dependencies
rush update 
# Build all packages
rush build
# Execute all tests
rush test -v
```
For more tips on using rush, see rush's official website [Rush](https://rushjs.io/).

## Directory structure of the repository
The libuild directory consists of the following main sections
```bash
* examples - contains all the examples
* tests - contains the main tests
* packages - contains the main packages in monorepo
* tools - contains some common general configuration
```

## Workflow

### Local development
Most of the packages provide watch scripts, we execute the watch script daily to get the latest build results in real time.

### Local Testing
After we develop a feature, we need to add test cases for the corresponding feature. libuild itself comes with test coverage chokepoints, so if there are no corresponding tests, there is a high chance that your MR's CI will not pass.
The tests in libuild are usually divided into three categories
* Unit tests
* Integration tests
* Snapshot testing

If our functionality affects the snapshot data, our tests will also fail and we need to update the test snapshot using
```sh
# Update snapshots of all tests
rush snapshot
```
### Dependency management
Since it is very difficult for the community to strictly adhere to semver, and if an upstream library does not adhere to semver, it may affect all of libuild's historical versions, we take the strictest dependency management approach to ensure the stability of libuild's historical versions, so that even if an upstream library makes a corrupt update, it will not affect libuild's historical version. As a result, libuild has a number of requirements for dependencies on three-party libraries, as follows.

* Require that all repositories in the libuild repository have the same version of all three repositories (whitelist exemptions are available for special cases), which ensures the performance of rush updates and facilitates unified version update management.
* This ensures that any commits in the history will be able to reproduce the structure of node_modules stably and ensure the stability of historical commits.
* Write dead version numbers for three-party dependencies and forbid semver expressions to avoid unknowing version upgrades, which to some extent avoids the impact of destructive three-party updates on libuild.
* @modern-js/libuild bundle three-party dependencies by default, so please **not** add them to dependency, but to devDependency.
* Regularly update important three-way dependencies to ensure that the latest performance optimizations and improvements are available.

### Pull Request Standard
* Libuild uses Lineary History for branch management, always keeping a linear history so that we can better track changes to the project. The project forbids branch merging with merge, only with rebase. Please **do not** do any merge locally.
* If you add a new feature, you should add a test case for it, and explain some of the background of the feature in the MR dscription, and associate it with the corresponding issue in the MR.
* If you fix a bug, you should describe the bug in the description and associate it with the corresponding issue in the MR.
* If you optimize performance, it's a good idea to include before and after performance optimization data.
* Please be proactive and squash a few scattered commits before committing the MR, we encourage only one commit per MR.
* The commit msg must conform to the commit message specification, which we will check during the ci and pre-commit phases.


### Release management
Libuild releases are still based on rush publish, and the basic flow is as follows
The release is divided into the following phases
* Daily development: In the daily development phase, we need to run the rush change command to generate change.json for each MR, and commit it to mr.
* Pre-release: execute npm run bump:{alpha,minor,major,patch} command to bump all version numbers and commit to MR.
* CI release: After the pre-release MR from the previous step is merged in, manually trigger the release action in github's Action to make the release.
* Create release: After the CI release is successful, create the corresponding release on github.
* Release note: When the release is successful, write the release note of the relevant version on the official website, and publish it to the official website.
