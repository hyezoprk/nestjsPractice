import prettier from "eslint-plugin-prettier";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: process.cwd(),
        ecmaFeatures: {
          legacyDecorators: true, // Babel-style 데코레이터 지원
        },
        // 최신 데코레이터 proposal 지원
        // 아래 옵션은 @typescript-eslint/parser 6.x 이상에서 지원
        experimentalDecorators: true,
      },
    },
    plugins: {
      prettier: prettier,
      "@typescript-eslint": tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      "prettier/prettier": "error",
      "@typescript-eslint/no-explicit-any": "off", // any 허용
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }
      ],
      "@typescript-eslint/no-empty-object-type": "off", // 빈 객체 타입 허용
    },
    ignores: [
      "node_modules",
      "dist",
      "build",
      "out",
      "coverage",
      ".next",
      ".turbo",
      ".cache",
      "public",
      "tmp",
      "temp",
      ".git",
      "test/**",
      "**/*.spec.ts"
    ],
  },
];
