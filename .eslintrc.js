module.exports = {
  extends: [
    'eslint:recommended',
    'airbnb'
  ],
  parser: 'babel-eslint',
  plugins: [
    'react',
    'import'
  ],
  env: {
    browser: true,
    mocha: true,
    node: true,
    es6: true,
    jquery: true
  },
  ecmaFeatures: {
    jsx: true
  },
  globals: {},
  rules: {
    // Best Practices
    'consistent-return': 0,
    'curly': [1, 'all'],
    'no-else-return': 1,
    'no-multi-spaces': [1, {
      'exceptions': {
        'Property': true,
        'VariableDeclarator': true,
        'ImportDeclaration': true
      }
    }],
    'no-param-reassign': [2, {
      'props': false
    }],

    // Strict Mode
    'strict': [1, 'safe'],

    // Variables
    'no-unused-vars': 1,

    // Stylistic Issues
    'comma-dangle': 0,
    'consistent-this': 2,
    'jsx-quotes': 1,
    'newline-per-chained-call': 0,
    'no-restricted-syntax': [
      'error',
      'ForInStatement',
      'LabeledStatement',
      'WithStatement',
    ],
    'object-curly-spacing': 0,

    // ECMAScript 6
    'arrow-body-style': 0,
    'arrow-parens': [2, 'always'],
    'prefer-reflect': 1,

    // React
    'react/jsx-closing-bracket-location': 0,
    'react/jsx-first-prop-new-line': 0,
    'react/jsx-no-bind': 0,

    // jsx-a11y
    'jsx-a11y/img-has-alt': 1
  }
}
