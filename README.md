# create-s6-app

Zero-dependency Laravel installer powered by Node.js. Run Laravel projects anywhere without installing PHP or Composer system-wide.

[![NPM version](https://img.shields.io/npm/v/create-s6-app.svg)](https://www.npmjs.com/package/create-s6-app)
[![Downloads](https://img.shields.io/npm/dm/create-s6-app.svg)](https://www.npmjs.com/package/create-s6-app)
[![License](https://img.shields.io/npm/l/create-s6-app.svg)](https://github.com/souravdutt/create-laravel-app/blob/main/LICENSE)


## Getting Started

To scaffold a Laravel app using `create-s6-app`, run:

```bash
npx create-s6-app my-app
cd my-app
../bin/php artisan serve
```

## Table of Contents

- [create-s6-app](#create-s6-app)
  - [Getting Started](#getting-started)
  - [Table of Contents](#table-of-contents)
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