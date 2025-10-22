# Contributing to eCommerce Backend

Thank you for considering contributing to this project! This document provides guidelines and instructions for contributing.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

### Our Pledge
We are committed to providing a welcoming and inspiring community for all.

### Our Standards
- Be respectful and inclusive
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards others

## Getting Started

### Prerequisites
- Node.js v16 or higher
- MongoDB (local or Atlas)
- Git
- Code editor (VS Code recommended)

### Setup Development Environment

1. **Fork the repository**
   ```bash
   # Click the "Fork" button on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/ecommerce-backend.git
   cd ecommerce-backend
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/ecommerce-backend.git
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

## Development Workflow

### 1. Create a Branch

Always create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Adding tests
- `chore/` - Maintenance tasks

### 2. Make Changes

- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Update documentation as needed

### 3. Test Your Changes

```bash
# Run tests
npm test

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix
```

### 4. Commit Your Changes

```bash
git add .
git commit -m "feat: add user profile update feature"
```

### 5. Keep Your Branch Updated

```bash
git fetch upstream
git rebase upstream/main
```

### 6. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 7. Create Pull Request

Go to GitHub and create a pull request from your fork to the main repository.

## Coding Standards

### JavaScript Style Guide

We follow the Airbnb JavaScript Style Guide with some modifications.

#### General Rules

1. **Use ES6+ features**
   ```javascript
   // Good
   const user = { name, email };
   const users = [...oldUsers, newUser];
   
   // Bad
   var user = { name: name, email: email };
   var users = oldUsers.concat([newUser]);
   ```

2. **Use async/await over callbacks**
   ```javascript
   // Good
   const user = await User.findById(id);
   
   // Bad
   User.findById(id, (err, user) => {
     // ...
   });
   ```

3. **Use destructuring**
   ```javascript
   // Good
   const { firstName, lastName } = req.body;
   
   // Bad
   const firstName = req.body.firstName;
   const lastName = req.body.lastName;
   ```

4. **Use template literals**
   ```javascript
   // Good
   const message = `Hello, ${name}!`;
   
   // Bad
   const message = 'Hello, ' + name + '!';
   ```

### File Structure

```javascript
// 1. External imports
const express = require('express');
const mongoose = require('mongoose');

// 2. Internal imports
const User = require('../models/User');
const { asyncHandler } = require('../utils/errorHandler');

// 3. Constants
const MAX_RETRIES = 3;

// 4. Main code
exports.getUser = asyncHandler(async (req, res) => {
  // Implementation
});
```

### Naming Conventions

- **Variables & Functions**: camelCase
  ```javascript
  const userName = 'John';
  function getUserById() {}
  ```

- **Classes & Models**: PascalCase
  ```javascript
  class UserService {}
  const User = mongoose.model('User', userSchema);
  ```

- **Constants**: UPPER_SNAKE_CASE
  ```javascript
  const MAX_FILE_SIZE = 5242880;
  const API_VERSION = 'v1';
  ```

- **Private functions**: _prefixed
  ```javascript
  function _validateInput() {}
  ```

### Error Handling

Always use the asyncHandler wrapper for async routes:

```javascript
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  
  res.status(200).json({
    success: true,
    data: { user },
  });
});
```

### Comments

Add comments for complex logic:

```javascript
/**
 * Calculate shipping cost based on weight and destination
 * @param {number} weight - Total weight in kg
 * @param {string} country - Destination country code
 * @returns {number} Shipping cost in USD
 */
function calculateShipping(weight, country) {
  // Base rate for domestic shipping
  const baseRate = 5;
  
  // Additional cost per kg
  const perKgRate = 2;
  
  // International multiplier
  const multiplier = country === 'US' ? 1 : 2;
  
  return (baseRate + weight * perKgRate) * multiplier;
}
```

## Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements

### Examples

```bash
feat(auth): add password reset functionality

Implemented password reset with email verification.
Users can now request a password reset link via email.

Closes #123
```

```bash
fix(cart): resolve item quantity update issue

Fixed bug where cart item quantity wasn't updating correctly
when the same product was added multiple times.

Fixes #456
```

```bash
docs(readme): update installation instructions

Added detailed steps for MongoDB Atlas setup
and Cloudinary configuration.
```

## Pull Request Process

### Before Submitting

1. ✅ Code follows style guidelines
2. ✅ All tests pass
3. ✅ New tests added for new features
4. ✅ Documentation updated
5. ✅ No console.log statements
6. ✅ Branch is up to date with main

### PR Title Format

Use the same format as commit messages:

```
feat(auth): add OAuth authentication
fix(orders): resolve payment processing bug
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe how you tested your changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] All tests passing
- [ ] No new warnings

## Screenshots (if applicable)

## Related Issues
Closes #123
```

### Review Process

1. At least one maintainer must review
2. All comments must be resolved
3. All checks must pass
4. No merge conflicts

## Testing

### Writing Tests

Place tests in the `tests/` directory:

```javascript
const request = require('supertest');
const app = require('../src/app');

describe('User API', () => {
  describe('POST /api/v1/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'password123',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('john@example.com');
    });
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/auth.test.js

# Run with coverage
npm test -- --coverage

# Watch mode
npm run test:watch
```

### Test Coverage

Aim for at least 80% code coverage for new features.

## Documentation

### Code Documentation

Use JSDoc for functions:

```javascript
/**
 * Get user by ID
 * @param {string} userId - The user's ID
 * @returns {Promise<Object>} User object
 * @throws {AppError} If user not found
 */
async function getUserById(userId) {
  // Implementation
}
```

### API Documentation

Update Swagger documentation when adding new endpoints:

```javascript
/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User found
 *       404:
 *         description: User not found
 */
```

### README Updates

Update README.md when:
- Adding new features
- Changing configuration
- Adding dependencies
- Modifying setup process

## Questions?

- Open an issue for bugs
- Start a discussion for feature requests
- Contact maintainers for other questions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing! 🎉
