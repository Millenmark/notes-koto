# Notes Koto - NestJS Notes Application

A secure notes application built with NestJS, MongoDB, and Google OAuth authentication.

## Features

- **Google OAuth Authentication**: Users can log in using their Google accounts
- **JWT Token-based Authorization**: Secure API access with JWT tokens
- **CRUD Operations**: Create, read, update, and delete notes
- **User-specific Notes**: Each user can only access their own notes
- **MongoDB Integration**: Persistent data storage with MongoDB
- **Input Validation**: Request validation using class-validator
- **CORS Support**: Cross-origin resource sharing enabled

## API Endpoints

### Authentication

- `GET /auth/google` - Initiate Google OAuth login
- `GET /auth/google/callback` - Google OAuth callback
- `GET /auth/profile` - Get current user profile (requires JWT)
- `POST /auth/logout` - Logout user (requires JWT)

### Notes

- `POST /api/notes` - Create a new note (requires JWT)
- `GET /api/notes` - Get all notes for authenticated user (requires JWT)
- `GET /api/notes/:id` - Get specific note (requires JWT)
- `PUT /api/notes/:id` - Update note (requires JWT)
- `DELETE /api/notes/:id` - Delete note (requires JWT)

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Google OAuth credentials

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/notes-koto

# Google OAuth (Get from Google Cloud Console)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# Application
PORT=3000
NODE_ENV=development
```

### 3. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/auth/google/callback`
6. Copy Client ID and Client Secret to your `.env` file

### 4. MongoDB Setup

- **Local MongoDB**: Install MongoDB locally and ensure it's running on port 27017
- **MongoDB Atlas**: Create a cluster and update the `MONGODB_URI` in `.env`

### 5. Run the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The application will be available at `http://localhost:3000`

## Usage

### Authentication Flow

1. Navigate to `http://localhost:3000/auth/google` to initiate Google login
2. Complete Google OAuth flow
3. You'll be redirected with a JWT token
4. Use the JWT token in the Authorization header for API requests:
   ```
   Authorization: Bearer <your_jwt_token>
   ```

### Creating Notes

```bash
curl -X POST http://localhost:3000/api/notes \
  -H "Authorization: Bearer <your_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"title": "My Note", "content": "Note content here"}'
```

### Getting Notes

```bash
curl -X GET http://localhost:3000/api/notes \
  -H "Authorization: Bearer <your_jwt_token>"
```

## Security Features

- **JWT Authentication**: All note endpoints require valid JWT tokens
- **User Isolation**: Users can only access their own notes
- **Input Validation**: All inputs are validated using class-validator
- **CORS Protection**: Configured for specific origins
- **Authorization Checks**: Ownership verification for all note operations

## Project Structure

```
src/
├── auth/                 # Authentication module
│   ├── guards/          # Auth guards (JWT, Google)
│   ├── strategies/      # Passport strategies
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── notes/               # Notes module
│   ├── dto/            # Data transfer objects
│   ├── notes.controller.ts
│   ├── notes.service.ts
│   └── notes.module.ts
├── schemas/            # MongoDB schemas
│   ├── user.schema.ts
│   └── note.schema.ts
├── app.module.ts       # Main application module
└── main.ts            # Application entry point
```

## Development

```bash
# Run in development mode
npm run start:dev

# Run tests
npm run test

# Run e2e tests
npm run test:e2e

# Lint code
npm run lint

# Format code
npm run format
```

## Error Handling

The application includes proper error handling for:

- Invalid JWT tokens (401 Unauthorized)
- Missing notes (404 Not Found)
- Unauthorized access to notes (403 Forbidden)
- Validation errors (400 Bad Request)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request
