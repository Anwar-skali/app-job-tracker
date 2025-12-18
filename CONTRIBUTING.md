# Contributing

## Git Workflow

### Branch Strategy

- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/`: Individual feature branches

### Creating a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### Commit Messages

Use clear, descriptive commit messages:

```
feat: Add user authentication screen
fix: Resolve navigation issue on Android
refactor: Improve API service structure
```

### Pull Requests

1. Ensure code follows project style
2. Test on iOS and Android if possible
3. Create PR with clear title and description
4. Include screenshots for UI changes

## Code Organization

- Components: `src/components/`
- Screens: `src/screens/`
- Services: `src/services/`
- Utils: `src/utils/`
- Types: `src/types/`
- Hooks: `src/hooks/`
- Constants: `src/constants/`

## Naming Conventions

- Components: PascalCase
- Files: camelCase for utilities, PascalCase for components
- Functions: camelCase
- Constants: UPPER_SNAKE_CASE

## Code Style

- Use TypeScript for type safety
- Keep components small and focused
- Write self-documenting code

