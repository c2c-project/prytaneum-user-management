module.exports = {
    // parser: 'babel-eslint',
    //meteorjs/eslint-config-meteor uses airbnb
    extends: [
        'airbnb-typescript/base',
        'prettier',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:jest/recommended',
    ],
    parserOptions: {
        project: './tsconfig.json',
    },
    rules: {
        quotes: ['error', 'single'],
        indent: 'off',
        '@typescript-eslint/indent': ['error', 4, { SwitchCase: 1 }],
        'jsx-quotes': ['error', 'prefer-single'],
        'import/no-extraneous-dependencies': [
            'error',
            { devDependencies: ['**/*.test.*', '**/*.stories.*'] },
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
