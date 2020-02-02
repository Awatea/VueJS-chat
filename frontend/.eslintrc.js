module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/essential',
    '@vue/airbnb',
  ],
  rules: {
    // don't require .vue extension when importing
    'import/extensions': ['error', 'always', {
      js: 'never',
      vue: 'never'
    }],
    // disallow reassignment of function parameters
    // disallow parameter object manipulation except for specific exclusions
    'no-param-reassign': ['error', {
      props: true,
      ignorePropertyModificationsFor: [
        'state', // for vuex state
        'acc', // for reduce accumulators
        'e' // for e.returnvalue
      ]
    }],
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-tabs': ["error", { allowIndentationTabs: true }],
    'max-len': ["error", { ignorePattern: "(url\([\'\"]?(data|http[s]?)?.*\)|src=[\"\']?.*[\'\"]?|http[s]:)", "ignoreStrings": true, "ignoreTemplateLiterals": true }],
    "indent": ["error", "tab"],
    "arrow-parens": ["error", "as-needed"],
    "no-console": ["error", { allow: ["log"] }],
    "no-param-reassign": ["error", { "props": false }],
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
};
