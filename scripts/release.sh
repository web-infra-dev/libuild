npm config set '//registry.npmjs.org/:_authToken' "${NPM_TOKEN}"

rush change
rush version --bump
NPM_TOKEN=xxxx rush publish --add-commit-details  --publish --include-all

git add .
git commit -m 'chore: release'