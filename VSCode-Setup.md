# VS Code Setup for Ticketing System Development

## Recommended VS Code Settings

Create `.vscode/settings.json` in your project:

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.updateImportsOnFileMove.enabled": "always",
  "typescript.preferences.importModuleSpecifier": "relative",
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.next": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/coverage": true
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

## Useful Code Snippets

Create `.vscode/snippets.code-snippets`:

```json
{
  "Express Route Handler": {
    "prefix": "route",
    "body": [
      "router.${1:get}('/${2:path}', authenticate, async (req: Request, res: Response) => {",
      "  try {",
      "    const result = await ${3:service}.${4:method}(req.${5:params});",
      "    res.json({",
      "      success: true,",
      "      data: result",
      "    });",
      "  } catch (error) {",
      "    next(error);",
      "  }",
      "});"
    ]
  },
  "React Component": {
    "prefix": "rfc",
    "body": [
      "import React from 'react';",
      "",
      "interface ${1:ComponentName}Props {",
      "  ${2:// props}",
      "}",
      "",
      "export const ${1:ComponentName}: React.FC<${1:ComponentName}Props> = (props) => {",
      "  return (",
      "    <div className=\"${3:}\">",
      "      ${4:// content}",
      "    </div>",
      "  );",
      "};"
    ]
  },
  "Prisma Model": {
    "prefix": "model",
    "body": [
      "model ${1:ModelName} {",
      "  id          String   @id @default(cuid())",
      "  ${2:field}    ${3:String}",
      "  createdAt   DateTime @default(now())",
      "  updatedAt   DateTime @updatedAt",
      "",
      "  ${4:// relations}",
      "}"
    ]
  },
  "API Service": {
    "prefix": "service",
    "body": [
      "export class ${1:ServiceName}Service {",
      "  async ${2:methodName}(${3:params}: ${4:ParamsType}): Promise<${5:ReturnType}> {",
      "    try {",
      "      ${6:// implementation}",
      "    } catch (error) {",
      "      throw new AppError('${7:Error message}', 500);",
      "    }",
      "  }",
      "}"
    ]
  },
  "Jest Test": {
    "prefix": "test",
    "body": [
      "describe('${1:Component/Service}', () => {",
      "  beforeEach(() => {",
      "    ${2:// setup}",
      "  });",
      "",
      "  it('should ${3:description}', async () => {",
      "    // Arrange",
      "    ${4:// setup test data}",
      "",
      "    // Act",
      "    ${5:// perform action}",
      "",
      "    // Assert",
      "    expect(${6:result}).${7:toBe}(${8:expected});",
      "  });",
      "});"
    ]
  }
}
```

## Launch Configuration

Create `.vscode/launch.json` for debugging:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/backend/src/server.ts",
      "preLaunchTask": "tsc: build - backend/tsconfig.json",
      "outFiles": ["${workspaceFolder}/backend/dist/**/*.js"],
      "env": {
        "NODE_ENV": "development"
      }
    },
    {
      "type": "chrome",
      "request": "launch",
      "name": "Debug Frontend",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/frontend/src",
      "sourceMapPathOverrides": {
        "webpack:///src/*": "${webRoot}/*"
      }
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Jest Debug",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": [
        "--runInBand",
        "--no-cache",
        "--watchAll=false"
      ],
      "cwd": "${workspaceFolder}",
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

## Tasks Configuration

Create `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start Dev Environment",
      "type": "shell",
      "command": "docker-compose up -d && npm run dev",
      "problemMatcher": [],
      "group": {
        "kind": "build",
        "isDefault": true
      }
    },
    {
      "label": "Run Tests",
      "type": "shell",
      "command": "npm test",
      "group": "test"
    },
    {
      "label": "Generate Prisma Client",
      "type": "shell",
      "command": "npx prisma generate",
      "problemMatcher": []
    },
    {
      "label": "Run Database Migration",
      "type": "shell",
      "command": "npx prisma migrate dev",
      "problemMatcher": []
    }
  ]
}
```

## Recommended Extensions List

Create `.vscode/extensions.json`:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "prisma.prisma",
    "bradlc.vscode-tailwindcss",
    "ms-azuretools.vscode-docker",
    "eamodio.gitlens",
    "christian-kohler.path-intellisense",
    "aaron-bond.better-comments",
    "streetsidesoftware.code-spell-checker",
    "wayou.vscode-todo-highlight",
    "gruntfuggly.todo-tree",
    "humao.rest-client",
    "orta.vscode-jest",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "burkeholland.simple-react-snippets",
    "github.copilot",
    "yoavbls.pretty-ts-errors"
  ]
}
```

## Quick Commands Cheatsheet

Add to your README or keep handy:

```bash
# Development
npm run dev                 # Start development servers
npm run dev:backend        # Start backend only
npm run dev:frontend       # Start frontend only

# Database
npm run db:migrate         # Run migrations
npm run db:seed           # Seed database
npm run db:reset          # Reset database
npm run db:studio         # Open Prisma Studio

# Testing
npm test                  # Run all tests
npm run test:unit        # Run unit tests
npm run test:e2e         # Run E2E tests
npm run test:coverage    # Generate coverage report

# Building
npm run build            # Build for production
npm run build:docker     # Build Docker images

# Linting
npm run lint             # Run ESLint
npm run lint:fix         # Fix linting issues
npm run format           # Format with Prettier

# Git Workflow
git flow feature start <feature-name>
git flow feature finish <feature-name>
git flow release start <version>
git flow release finish <version>
```

## AI Coding Assistant Tips

When using GitHub Copilot or other AI assistants in VS Code:

1. **Write clear comments** before functions to get better suggestions
2. **Use descriptive variable names** for context
3. **Start with interfaces/types** to guide AI suggestions
4. **Write test descriptions first** for TDD with AI
5. **Use JSDoc comments** for better function suggestions

Example:
```typescript
/**
 * Creates a new ticket in the system
 * @param ticketData - The ticket information from the user
 * @param userId - The ID of the user creating the ticket
 * @returns The created ticket with generated ID and timestamps
 */
async function createTicket(ticketData: CreateTicketDto, userId: string): Promise<Ticket> {
  // AI will provide better suggestions with this context
}
```

## Keyboard Shortcuts

Custom shortcuts for productivity:

```json
// Add to keybindings.json
[
  {
    "key": "ctrl+shift+t",
    "command": "workbench.action.terminal.new"
  },
  {
    "key": "ctrl+shift+g",
    "command": "workbench.view.scm"
  },
  {
    "key": "ctrl+shift+d",
    "command": "workbench.view.debug"
  },
  {
    "key": "ctrl+shift+e",
    "command": "workbench.view.explorer"
  }
]
```

## Debugging Tips

1. **Use conditional breakpoints** for specific scenarios
2. **Log points** instead of console.log for production
3. **Watch expressions** for complex objects
4. **Call stack** navigation for tracing issues
5. **Debug console** for runtime evaluation

---

Happy coding! 🚀