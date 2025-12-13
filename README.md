# EigenWatch Frontend

A monorepo containing the frontend applications and shared packages for EigenWatch. This project is built using [Turborepo](https://turbo.build/repo) to manage the workspace and optimize build tasks.

## Repository Structure

This repository is organized as a monorepo with the following structure:

### Apps

- **`apps/dashboard`**: The main dashboard application for EigenWatch.
- **`apps/web`**: The public-facing web application.
- **`apps/docs`**: The documentation site.

### Packages

- **`packages/ui`**: A shared React component library used across applications.
- **`packages/eslint-config`**: Shared ESLint configurations (includes `eslint-config-next` and `eslint-config-prettier`).
- **`packages/typescript-config`**: Shared `tsconfig.json`s used throughout the monorepo.

## Getting Started

### Prerequisites

- **Node.js**: Version 18 or higher is required.
- **npm**: This project uses `npm` as the package manager (version 10.8.2 or compatible).

### Installation

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd eigenwatch-frontend
npm install
```

### Running Development Server

To start the development server for all applications:

```bash
npm run dev
```

## Available Commands

The following commands can be run from the root of the repository:

- **`npm run build`**: Build all apps and packages.
- **`npm run dev`**: Start the development server. This is an interactive script that asks you which app you want to run (`web`, `docs`, or `dashboard`). You can also pass the app name as an argument (e.g., `npm run dev web`). It automatically detects available ports.
- **`npm run lint`**: Run ESLint across all apps and packages.
- **`npm run format`**: Format code using Prettier.
- **`npm run check-types`**: Run TypeScript type checking across the workspace.

## Useful Links

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
