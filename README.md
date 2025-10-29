# create-s6-app

Zero-dependency Laravel installer with hybrid type safety (PHP ↔ TypeScript). Run Laravel projects anywhere without installing PHP or Composer system-wide.

[![NPM version](https://img.shields.io/npm/v/create-s6-app.svg)](https://www.npmjs.com/package/create-s6-app)
[![Downloads](https://img.shields.io/npm/dm/create-s6-app.svg)](https://www.npmjs.com/package/create-s6-app)
[![License](https://img.shields.io/npm/l/create-s6-app.svg)](https://github.com/souravdutt/create-laravel-app/blob/main/LICENSE)


## Getting Started

### Standard Installation (Type-Safe by Default)

```bash
npm create s6-app@latest my-app
cd my-app
npm run gen:types
npm run migrate
npm run dev
```

### Without Type Safety (Not Recommended)

```bash
npm create s6-app@latest my-app --no-typesafe
cd my-app
npm run migrate
npm run dev
```

Access your app at:
- **Laravel API**: http://127.0.0.1:8000
- **Vite Dev Server**: http://localhost:5173

## Features

✨ **Zero System Dependencies**: No need for system PHP or Composer  
🔒 **Hybrid Type Safety**: PHP DTOs automatically converted to TypeScript + Zod schemas  
🚀 **Auto-generated API Client**: Type-safe fetch wrappers from Laravel routes  
⚡ **Watch Mode**: Auto-regenerate types on DTO changes  
🎯 **Runtime Validation**: Zod-powered validation for all API responses  
📦 **Batteries Included**: TypeScript, Vite, and all tooling pre-configured  
🛠️ **Unified Commands**: Use `npm run` for everything - no need to remember PHP/Composer paths

## Table of Contents

- [create-s6-app](#create-s6-app)
  - [Getting Started](#getting-started)
    - [Standard Installation (Type-Safe by Default)](#standard-installation-type-safe-by-default)
    - [Without Type Safety (Not Recommended)](#without-type-safety-not-recommended)
  - [Features](#features)
  - [Table of Contents](#table-of-contents)
  - [Type Safety System](#type-safety-system)
    - [How It Works](#how-it-works)
    - [Example Workflow](#example-workflow)
  - [The S6 Vision](#the-s6-vision)
  - [S6 Principles](#s6-principles)
    - [1. Solve Real Problems](#1-solve-real-problems)
    - [2. Modernize Responsibly](#2-modernize-responsibly)
    - [3. Type Safety Isn't Optional](#3-type-safety-isnt-optional)
  - [Contributing](#contributing)
    - [How to Contribute](#how-to-contribute)
    - [Areas for Contribution](#areas-for-contribution)
    - [Development Setup](#development-setup)
  - [Community](#community)
  - [Contributors](#contributors)
  - [License](#license)

## Type Safety System

Type safety is **enabled by default** in all new projects. This gives you a fully configured hybrid type safety system inspired by create-t3-app.

> **Note**: Use `--no-typesafe` to skip type safety setup (not recommended for production projects).

### How It Works

1. **Define DTOs in PHP**:
```php
#[TypeScript]
class UserDto {
    public function __construct(
        public int $id,
        public string $name,
        public string $email,
    ) {}
}
```

2. **Use DTOs in Controllers**:
```php
public function index(): JsonResponse {
    $users = User::all()->map(fn($u) => new UserDto(...));
    return response()->json($users);
}
```

3. **Generate Types**:
```bash
npm run gen:types
```

4. **Use Type-Safe API Client**:
```typescript
import { api } from '@/api/client';

const users = await api.getUsers();
// ✅ Fully typed as UserDto[]
// ✅ Runtime validated with Zod
// ✅ Autocomplete and type checking
```

### Example Workflow

```bash
# Start watch mode (auto-regenerates on DTO changes)
npm run watch:types

# In another terminal, start dev server
npm run dev

# Now edit any DTO in app/DTO/
# Types regenerate automatically
# TypeScript errors appear instantly in VSCode
```

**Available Commands**:
- `npm run dev` - Start Laravel + Vite dev servers
- `npm run serve` - Start Laravel server only
- `npm run migrate` - Run database migrations
- `npm run gen:types` - Generate TypeScript types from PHP
- `npm run type-check` - TypeScript type checking
- `npm run watch:types` - Watch mode for auto-regeneration

For advanced usage, you can still use:
- `npx artisan <command>` - Run any Laravel Artisan command
- `npx composer <command>` - Run any Composer command

**Generated Files**:
- `resources/js/types/UserDto.ts` - Zod schema + TypeScript interface
- `resources/js/api/client.ts` - Type-safe API client
- `resources/js/types/generated.d.ts` - Additional type definitions

See the `TYPE_SAFETY.md` guide (generated in your project) for complete documentation.

## The S6 Vision

Inspired by the T3 Stack, we're reimagining Laravel development with modern tooling to make PHP development more robust and enjoyable. Our goals include:

- **Run Anywhere/Everywhere**: Pure npm-based installation (no curl commands needed)
- **Single Command Setup**: Install everything with one command
- **Type Safety**: Full TypeScript integration for better developer experience
- **Linting**: Built-in code quality tools
- **Modern Database Layer**: Prisma-like database management with type safety
- **SPA Integration**: Seamless single-page application support
- **Validation**: Zod-powered schema validation
- **Type-Safe APIs**: tRPC-style communication between PHP backend and frontend (detect changes in controllers and get errors in Blade/frontend)

These enhancements aim to bring PHP development into the modern era, combining Laravel's power with cutting-edge tools.

## S6 Principles

### 1. Solve Real Problems

We focus on adding features that address genuine pain points in Laravel development. Everything included should provide clear value without unnecessary complexity.

### 2. Modernize Responsibly

We embrace modern tools and practices while maintaining Laravel's reliability. We prioritize stability for core functionality while experimenting with innovative features.

### 3. Type Safety Isn't Optional

Full-stack type safety is our north star. Any feature that compromises type safety should be implemented elsewhere.

This creates a fully functional Laravel project with bundled PHP and Composer binaries.

## Contributing

We welcome contributions! This project is in active development, and we need help implementing the vision above.

### How to Contribute

1. **Fork and Clone**: Fork the repo and clone it locally
2. **Install Dependencies**: `npm install`
3. **Test Locally**: `npm test`
4. **Make Changes**: Implement features or fix issues
5. **Submit PR**: Create a pull request with a clear description

### Areas for Contribution

- **TypeScript Integration**: Add TS support to the CLI and generated projects
- **Database Tools**: Integrate Prisma or similar for Laravel
- **Frontend Integration**: Add SPA frameworks and tRPC-like type safety
- **Validation**: Implement Zod schemas for Laravel validation
- **Linting**: Add ESLint/Prettier configurations
- **Documentation**: Improve docs and add examples
- **Testing**: Add comprehensive test coverage

### Development Setup

```bash
git clone https://github.com/souravdutt/create-laravel-app.git
cd create-laravel-app
npm install
npm test
```

Check out our [issues](https://github.com/souravdutt/create-laravel-app/issues) for specific tasks or propose new ideas!

## Community

For help, discussion about best practices, or any other conversation:

Join our [GitHub Discussions](https://github.com/souravdutt/create-laravel-app/discussions)

## Contributors

We 💖 contributors! Feel free to contribute to this project.

Made with [contrib.rocks](https://contrib.rocks/)

## License

MIT