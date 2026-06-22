# Project & Task Management API

A RESTful API for managing projects and tasks, built with Node.js, Express, TypeScript, and MongoDB.

## Tech Stack

| Category       | Technology                    |
| -------------- | ----------------------------- |
| Runtime        | Node.js (v18+)                |
| Framework      | Express.js                    |
| Language       | TypeScript                    |
| Database       | MongoDB                       |
| ODM            | Mongoose                      |
| Authentication | JWT (JSON Web Tokens)         |
| Validation     | Zod                           |
| API Docs       | Swagger / OpenAPI 3.0         |
| Testing        | Jest + Supertest              |
| Containerization | Docker & Docker Compose     |

## Features

- **Authentication & Authorization** - JWT-based auth with role-based access control (Admin/Member)
- **Projects CRUD** - Create, read, update, and delete projects
- **Tasks CRUD** - Full task management under projects with status tracking
- **Filtering** - Filter tasks by status (`pending`, `in_progress`, `done`) or priority (`low`, `medium`, `high`)
- **Pagination & Sorting** - All list endpoints support pagination and sorting
- **Input Validation** - All inputs validated using Zod schemas
- **Error Handling** - Centralized error handling with proper HTTP status codes
- **API Documentation** - Interactive Swagger UI at `/api-docs`
- **Docker Support** - Docker Compose setup for easy deployment
- **Unit Tests** - Comprehensive test suite with Jest

## Project Structure

```
src/
├── __tests__/          # Unit tests
├── config/             # Configuration (database, swagger, env)
├── controllers/        # Request handlers
├── middleware/          # Auth, validation, error handling middleware
├── models/             # Mongoose models (User, Project, Task)
├── routes/             # Express route definitions with Swagger docs
├── seeds/              # Database seed files
├── services/           # Business logic layer
├── types/              # TypeScript type definitions
├── utils/              # Utility classes (ApiError, ApiResponse)
├── app.ts              # Express app setup
└── server.ts           # Server entry point
```

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd project-task-manager
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/project-task-manager
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10
```

5. Seed the database (optional):
```bash
npm run seed
```

6. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3000` and Swagger docs at `http://localhost:3000/api-docs`.

### Using Docker

```bash
docker-compose up --build
```

This starts both the API server and MongoDB.

## API Endpoints

### Authentication
| Method | Endpoint             | Description          | Auth |
| ------ | -------------------- | -------------------- | ---- |
| POST   | `/api/auth/register` | Register a new user  | No   |
| POST   | `/api/auth/login`    | Login & get JWT      | No   |

### Projects
| Method | Endpoint            | Description              | Auth |
| ------ | ------------------- | ------------------------ | ---- |
| POST   | `/api/projects`     | Create a project         | Yes  |
| GET    | `/api/projects`     | Get all user's projects  | Yes  |
| GET    | `/api/projects/:id` | Get project by ID        | Yes  |
| PUT    | `/api/projects/:id` | Update project           | Yes  |
| DELETE | `/api/projects/:id` | Delete project           | Yes  |

### Tasks
| Method | Endpoint                                    | Description       | Auth |
| ------ | ------------------------------------------- | ----------------- | ---- |
| POST   | `/api/projects/:projectId/tasks`            | Create a task     | Yes  |
| GET    | `/api/projects/:projectId/tasks`            | Get all tasks     | Yes  |
| GET    | `/api/projects/:projectId/tasks/:taskId`    | Get task by ID    | Yes  |
| PUT    | `/api/projects/:projectId/tasks/:taskId`    | Update a task     | Yes  |
| DELETE | `/api/projects/:projectId/tasks/:taskId`    | Delete a task     | Yes  |

### Query Parameters (List Endpoints)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `sortBy` - Field to sort by (e.g., `createdAt`, `title`, `status`)
- `sortOrder` - Sort direction: `asc` or `desc`
- `status` - Filter tasks by status: `pending`, `in_progress`, `done`
- `priority` - Filter tasks by priority: `low`, `medium`, `high`

## Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Available Scripts

| Script              | Description                          |
| ------------------- | ------------------------------------ |
| `npm run dev`       | Start development server with hot reload |
| `npm run build`     | Compile TypeScript to JavaScript     |
| `npm start`         | Start production server              |
| `npm run seed`      | Seed the database with sample data   |
| `npm test`          | Run unit tests                       |
| `npm run test:coverage` | Run tests with coverage report   |

## Seed Data Credentials

After running `npm run seed`:

| Role   | Email              | Password     |
| ------ | ------------------ | ------------ |
| Admin  | admin@example.com  | password123  |
| Member | john@example.com   | password123  |

## Role-Based Access Control

- **Admin**: Can view, update, and delete all projects and tasks
- **Member**: Can only manage their own projects and tasks

## Implementation Notes

- Passwords are hashed using bcrypt before storage
- JWT tokens include user ID, email, and role
- Deleting a project cascades to delete all associated tasks
- MongoDB indexes are set on frequently queried fields for performance
- All API responses follow a consistent format: `{ success, message, data, pagination? }`
