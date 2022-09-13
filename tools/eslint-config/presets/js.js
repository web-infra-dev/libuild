module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true,
    jest: true,
  },
  extends: ['airbnb-base', 'plugin:financial/recommended'],
  settings: {
    propWrapperFunctions: [
      // The names of any function used to wrap propTypes, e.g. `forbidExtraProps`. If this isn't set, any propTypes wrapped in a function will be skipped.
      'forbidExtraProps',
      { property: 'freeze', object: 'Object' },
      { property: 'myFavoriteWrapper' },
    ],
    linkComponents: [
      // Components used as alternatives to <a> for linking, eg. <Link to={ url } />
      'Hyperlink',
      { name: 'Link', linkAttribute: 'to' },
    ],
  },
  globals: {
    globalThis: true,
  },
  rules: {
    /**
     * to allow: if (false) return
     */
    curly: ['error', 'multi-line'],
    /**
     * enforce consistent spacing inside braces (object-curly-spacin
     */
    'object-curly-spacing': ['error', 'always'],
    /**
     * allow comments begin with a lowercase character
     */
    'capitalized-comments': 0,
    /**
     * always semi.
     */
    semi: ['error', 'always'],
    /**
     * disallow the use of console, https://eslint.org/docs/rules/no-console
     */
    'no-console': 'off',
    /**
     * Enforce require() on the top-level module scope, ref: https://eslint.org/docs/rules/global-require
     */
    'global-require': 'off',
    /**
     * Require parens in arrow function arguments, ref: https://eslint.org/docs/rules/arrow-parens#as-needed
     */
    'arrow-parens': ['error', 'as-needed'],
    /**
     * Disallow Reassignment of Function Parameters, ref: https://eslint.org/docs/rules/no-param-reassign
     */
    'no-param-reassign': 'off',
    /**
     * Disallow Early Use, ref: https://eslint.org/docs/rules/no-use-before-define
     */
    'no-use-before-define': ['error', { functions: false, classes: false }],
    /**
     * Disallow await inside of loops, ref: https://eslint.org/docs/rules/no-await-in-loop
     */
    'no-await-in-loop': ['off'],
    /**
     * Disallow specific global variables, ref: https://eslint.org/docs/rules/no-restricted-globals
     */
    'no-restricted-globals': ['warn'],
    /**
     * enforce a maximum line length, ref: https://eslint.org/docs/rules/max-len
     */
    'max-len': ['warn', { code: 120, tabWidth: 2 }],
    /**
     * enforce consistent line breaks inside braces, ref: https://eslint.org/docs/rules/object-curly-newline
     */
    'object-curly-newline': [
      'error',
      {
        ObjectExpression: { multiline: true, consistent: true },
        ObjectPattern: { multiline: true, consistent: true },
        ImportDeclaration: { multiline: true, consistent: true },
        ExportDeclaration: { multiline: true, consistent: true },
      },
    ],
    /**
     * enforce placing object properties on separate lines,
     * refs:
     *   - https://eslint.org/docs/rules/object-property-newline
     *   - https://github.com/eslint/eslint/issues/11620
     *   - https://github.com/eslint/eslint/issues/12018
     */
    'object-property-newline': [
      'error',
      {
        allowAllPropertiesOnSameLine: true,
      },
    ],
    /**
     * Require Variable Declarations to be at the top of their scope, ref: https://eslint.org/docs/rules/vars-on-top
     */
    'vars-on-top': 'off',
    /**
     * disallow continue statements, ref: https://eslint.org/docs/rules/no-continue
     */
    'no-continue': 'off',
    /**
     * disallow the unary operators ++ and --, ref: https://eslint.org/docs/rules/no-plusplus
     */
    'no-plusplus': 'off',
    /**
     * Allow something like: fn && fn(), ref: https://eslint.org/docs/rules/no-unused-expressions
     */
    'no-unused-expressions': [
      'error',
      {
        allowShortCircuit: true,
      },
    ],
    /**
     * disallow dangling underscores in identifiers, ref: https://eslint.org/docs/rules/no-underscore-dangle
     */
    'no-underscore-dangle': 'off',
    /**
     * Enforce that class methods utilize this, ref: https://eslint.org/docs/rules/class-methods-use-this
     */
    'class-methods-use-this': 'off',
    /**
     * disallow specified syntax, ref: https://eslint.org/docs/rules/no-restricted-syntax
     */
    'no-restricted-syntax': 'off',
    /**
     * disallow nested ternary expressions, ref: https://eslint.org/docs/rules/no-nested-ternary
     */
    'no-nested-ternary': 'off',
    /**
     * require return statements to either always or never specify values, ref: https://eslint.org/docs/rules/consistent-return
     */
    'consistent-return': 'off',
    /**
     * ref: https://eslint.org/docs/rules/indent
     */
    indent: [
      'error',
      2,
      {
        MemberExpression: 'off',
        SwitchCase: 1,
      },
    ],
    /**
     * Disallow Undeclared Variables, ref: https://eslint.org/docs/rules/no-undef
     */
    'no-undef': ['error'],
    /**
     * enforce consistent linebreak style for operators, ref: https://eslint.org/docs/rules/operator-linebreak
     */
    'operator-linebreak': ['error', 'before'],
    /**
     * require or disallow strict mode directives, ref: https://eslint.org/docs/rules/strict
     */
    strict: ['warn'],
    /**
     * Require CamelCase, ref: https://eslint.org/docs/rules/camelcase
     */
    camelcase: ['warn'],
    /**
     * Disallow Warning Comments, ref: https://eslint.org/docs/rules/no-warning-comments
     */
    'no-warning-comments': ['warn'],
    /**
     * Disallow Unnecessary Nested Blocks, ref: https://eslint.org/docs/rules/no-lone-blocks
     */
    'no-lone-blocks': ['warn'],
    /**
     * Prefer destructuring from arrays and objects , ref: https://eslint.org/docs/rules/prefer-destructuring
     */
    'prefer-destructuring': ['warn'],
    /**
     * require using Error objects as Promise rejection reasons,
     * ref: https://eslint.org/docs/rules/prefer-promise-reject-errors
     */
    'prefer-promise-reject-errors': ['warn'],
    /**
     * require constructor names to begin with a capital letter, ref: https://eslint.org/docs/rules/new-cap
     */
    'new-cap': ['warn'],
    /**
     * enforce valid JSDoc comments, ref: https://eslint.org/docs/rules/valid-jsdoc
     */
    'valid-jsdoc': 'off',
    /**
     * require let or const instead of var, ref: https://eslint.org/docs/rules/no-var
     */
    'no-var': ['warn'],
    /**
     * Disallow Warning Comments, ref: https://eslint.org/docs/rules/no-prototype-builtins
     */
    'no-prototype-builtins': ['warn'],
    /**
     * Disallow Use of __proto__, ref: https://eslint.org/docs/rules/no-proto
     */
    'no-proto': ['warn'],
    /**
     * Require or disallow named function expressions, ref: https://eslint.org/docs/rules/func-names
     */
    'func-names': ['warn'],
    /**
     * Disallow Use of caller/callee, ref: https://eslint.org/docs/rules/no-caller
     */
    'no-caller': ['warn'],
    /**
     * enforce a maximum number of classes per file
     * ref: https://eslint.org/docs/rules/max-classes-per-file
     */
    'max-classes-per-file': ['warn'],
    /**
     * Forbid unassigned imports
     * ref: https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-unassigned-import.md
     */
    'import/no-unassigned-import': ['warn'],
    /**
     * Forbid require() calls with expressions,
     * ref: https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-dynamic-require.md
     */
    'import/no-dynamic-require': ['warn'],
    /**
     * When there is only a single export from a module, prefer using default export over named export.
     * ref: https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/prefer-default-export.md
     */
    'import/prefer-default-export': 0,
    /**
     *  Forbid the use of extraneous packages
     *  ref: https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-extraneous-dependencies.md
     */
    'import/no-extraneous-dependencies': ['warn'],
    /**
     * Disallow Warning Comments, ref: https://eslint.org/docs/rules/import/order
     */
    'import/order': ['warn'],
    /**
     * https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/extensions.md
     * ref: https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/extensions.md
     */
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
  },
};
