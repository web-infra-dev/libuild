#!/bin/sh
set -e
command=$1

if [ "$command" = "init" ] ; then
  npm install -g @microsoft/rush@5.66.2
  npm install -g pnpm@6.22
elif [ "$command" = "install" ] ; then
  npm run install
elif [ "$command" = "check" ] ; then
  rush change -v
elif [ "$command" = "build" ] ; then
  npm run build
elif [ "$command" = "test" ] ; then
  npm run test
elif [ "$command" = "coverage" ] ; then
  rush update-autoinstaller --name coverage-c8
  npm run coverage
fi
