# AGENT GUIDELINES

This document outlines the conventions and commands for agents operating within this repository.

## 1. Build, Lint, and Test Commands

### Build
- **Command**: `npm run build`
- **Description**: Compiles the TypeScript and React code into a production-ready build. This command performs type checking.

### Development Server
- **Command**: `npm run dev`
- **Description**: Starts the development server with hot-reloading for local development.

### Linting
- **Command**: *No explicit lint command found in `package.json`.*
- **Guideline**: Ensure code adheres to standard TypeScript and React best practices. Rely on IDE extensions (e.g., ESLint, Prettier) for real-time feedback. Type errors will be caught during the build process.

### Testing
- **Command**: *No explicit test command found in `package.json`.*
- **Running a Single Test**: If a testing framework (e.g., Vitest, Jest) is later introduced, consult its documentation for running individual tests (e.g., `vitest <path/to/test.ts>`, `jest <path/to/test.ts>`). Currently, no testing framework is configured.

## 2. Code Style Guidelines

This project utilizes TypeScript and React. Adherence to consistent coding style is crucial.

### Imports
- **Order**:
    1.  Third-party library imports (e.g., `react`, `@supabase/supabase-js`).
    2.  Local module imports.
- **Formatting**: Use absolute paths for module imports where configured, otherwise relative paths.
    ```typescript
    import React from 'react';
    import { someHelper } from '../utils/helpers';
    import { MyComponent } from '@/components/MyComponent'; // Example with path alias
    ```

### Formatting
- **General**: Maintain consistent indentation (2 spaces, inferred from `package.json` and common JS/TS practices).
- **Quotes**: Prefer single quotes for strings unless double quotes are required (e.g., for JSX props with string literals).
- **Semicolons**: Use semicolons at the end of statements.
- **Trailing Commas**: Use trailing commas for multi-line arrays and objects.

### Types
- **TypeScript First**: All new code should be written in TypeScript, leveraging interfaces and types for clarity and type safety.
- **Interfaces vs. Types**: Use `interface` for object shapes and `type` for unions, intersections, and other complex types.
- **Explicit Types**: Explicitly define types for function arguments, return values, and complex variable declarations. Avoid `any` unless absolutely necessary and justified.

### Naming Conventions
- **Variables & Functions**: `camelCase` (e.g., `userName`, `fetchUserData`).
- **React Components**: `PascalCase` (e.g., `UserProfile`, `AppHeader`).
- **Interfaces & Types**: `PascalCase` (e.g., `UserProps`, `ApiResponse`).
- **Files**: `PascalCase` for React components (e.g., `MyComponent.tsx`), `camelCase` or `kebab-case` for utility files (e.g., `helpers.ts`, `data-utils.ts`).

### Error Handling
- **Asynchronous Operations**: Use `try...catch` blocks for handling errors in `async`/`await` functions, especially when interacting with external APIs (e.g., Supabase, Gemini API).
- **React Components**: Implement React Error Boundaries for catching JavaScript errors anywhere in their child component tree, logging those errors, and displaying a fallback UI.
- **User Feedback**: Provide clear and concise error messages to the user where appropriate.

### General
- **Comments**: Use comments sparingly, primarily for explaining *why* certain code exists or for complex logic that isn't immediately obvious.
- **Readability**: Prioritize clear, readable code over overly clever or condensed code.
- **Modularity**: Break down large components or functions into smaller, reusable modules.

## 3. Cursor/Copilot Rules

*No specific Cursor or Copilot rules were found in this repository.*
