const Mocha = require('mocha');

const { Base } = Mocha.reporters;

function isLibuildErrorInstance(err) {
  return err instanceof Error && err.constructor.name === 'LibuildError';
}

function injectLibuildErrorHandler() {
  let list = Base.list;

  Base.list = function (failures) {
    list(failures);
    failures.forEach(function (test, i) {
      let err;
      if (test.err && test.err.multiple) {
        if (multipleTest !== test) {
          multipleTest = test;
          multipleErr = [test.err].concat(test.err.multiple);
        }
        err = multipleErr.shift();
      } else {
        err = test.err;
      }

      let testTitle = '';
      test.titlePath().forEach(function (str, index) {
        if (index !== 0) {
          testTitle += '\n     ';
        }
        for (var i = 0; i < index; i++) {
          testTitle += '  ';
        }
        testTitle += str;
      });

      if (isLibuildErrorInstance(err)) {
        const fmt = Base.color('error title', '  %s) %s:\n') + Base.color('error stack', '\n%s\n');
        Base.consoleLog(fmt, i + 1, testTitle, err.toString(), err.stack);
      }
    });
  };
}

module.exports = injectLibuildErrorHandler;
