module.exports = {
    // parser: 'babel-eslint',
    //meteorjs/eslint-config-meteor uses airbnb
    extends: ['airbnb-base', 'prettier', 'plugin:jest/recommended'],
    rules: {
        quotes: ['error', 'single'],
        indent: ['error', 4, { SwitchCase: 1 }],
        'jsx-quotes': ['error', 'prefer-single'],
        'import/no-extraneous-dependencies': [
            'error',
            { devDependencies: ['**/*.test.js', '**/*.stories.*'] },
        ],
        'import/no-absolute-path': 0,
        'no-underscore-dangle': 'off',
        'func-names': 'off',
    },
    env: {
        node: true,
        browser: true,
        'jest/globals': true,
    },
    settings: {
        'import/extensions': ['.js', '.jsx'],
        // 'import/resolver': {
        //     node: {
        //         paths: ['.']
        //     }
        //     // alias: {
        //     //     map: [['/src', './src']],
        //     //     extensions: ['.ts', '.js', '.jsx', '.json']
        //     // }
        // }
    },
};
