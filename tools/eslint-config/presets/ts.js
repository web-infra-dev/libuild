module.exports = {
  parser: '@typescript-eslint/parser',
  extends: ['plugin:@typescript-eslint/recommended'],
  settings: {
    'import/resolver': {
      typescript: {}, // this loads <rootdir>/tsconfig.json to eslint
    },
  },
  rules: {
    /**
     * Bans “// @ts-ignore” comments from being used
     * ref: https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/ban-ts-ignore.md
     */
    '@typescript-eslint/ban-ts-ignore': 0,
    /**
     * Require PascalCased class and interface names
     * ref: https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/class-name-casing.md
     */
    '@typescript-eslint/class-name-casing': 0,
    /**
     * Require that interface names should or should not prefixed with I
     * ref: https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/interface-name-prefix.md
     */
    '@typescript-eslint/interface-name-prefix': 0,
    /**
     * Disallow the declaration of empty interfaces
     * ref: https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-empty-interface.md
     */
    '@typescript-eslint/no-empty-interface': 0,
    /**
     * Enforce consistent indentation
     * ref: https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/indent.md
     */
    '@typescript-eslint/indent': ['error', 2],
    /**
     * Disallows the use of require statements except in import statements
     * ref: https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-var-requires.md
     */
    '@typescript-eslint/no-var-requires': 0,
    /**
     * Disallow the use of variables before they are defined
     * ref: https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-use-before-define.md
     */
    '@typescript-eslint/no-use-before-define': 0,
    '@typescript-eslint/no-non-null-assertion': 0,
    '@typescript-eslint/no-explicit-any': 0,
  },
};
