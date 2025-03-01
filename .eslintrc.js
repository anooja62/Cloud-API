module.exports = {
    env: {
        node: true,
        es2021: true
    },
    extends: [
        "eslint:recommended",
        "plugin:prettier/recommended" // Enforces Prettier formatting
    ],
    rules: {
        "prettier/prettier": ["error"], // Show Prettier errors as ESLint errors
        "no-console": "warn" // Warns about console.log (change to "error" if needed)
    }
};
