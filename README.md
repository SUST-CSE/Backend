# SUST-CSE Backend API

> **Professional, Type-Safe RESTful API for the Department of Computer Science and Engineering, SUST.**

A modular, production-ready backend service built with TypeScript, Express, and MongoDB, designed to power the SUST-CSE departmental portal with robust authentication, role-based access control, and comprehensive features for academic management.

---

## Table of Contents

- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Features](#-features)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [API Modules](#-api-modules)
- [Authentication & Authorization](#-authentication--authorization)
- [Scripts](#-scripts)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Deployment](#-deployment)

---

## Tech Stack

| Category | Technologies |
|----------|-------------|
| **Runtime** | Node.js (v18+) |
| **Language** | TypeScript 5.7 |
| **Framework** | Express.js 4.21 |
| **Database** | MongoDB (Mongoose ODM 8.9) |
| **Authentication** | JWT (jsonwebtoken), bcryptjs |
| **Validation** | Zod 3.24 |
| **File Upload** | Multer, Cloudinary |
| **Email** | Nodemailer |
| **Security** | Helmet, express-rate-limit, CORS |
| **Documentation** | Swagger (OpenAPI) |
| **Testing** | Jest, Supertest |
| **Dev Tools** | tsx, nodemon, ESLint |

---

## Architecture

This backend follows a **Modular Monolith** pattern with clear separation of concerns:

```
Backend/
├── src/
│   ├── app.ts              # Express app configuration
│   ├── server.ts           # Server startup & process handlers
│   ├── config/             # Configuration files (env, db, cloudinary)
│   ├── middleware/         # Express middleware (auth, error, validation)
│   ├── modules/            # Feature modules (MVC pattern)
│   │   ├── auth/           # Authentication & authorization
│   │   ├── user/           # User management
│   │   ├── blog/           # Blog & articles
│   │   ├── event/          # Events management
│   │   ├── finance/        # Financial transparency
│   │   ├── society/        # Society management
│   │   ├── alumni/         # Alumni directory
│   │   ├── academic/       # Academic resources
│   │   ├── payment/        # Payment tracking
│   │   ├── product/        # Product catalog
│   │   ├── application/    # Applications management
│   │   ├── work-assignment/ # Task assignments
│   │   ├── content/        # CMS content
│   │   ├── sports/         # Sports activities
│   │   └── email-log/      # Email logging
│   ├── routes/             # API route aggregator
│   ├── utils/              # Helper functions & utilities
│   └── tests/              # Test suites
├── scripts/                # Utility scripts (admin seeder)
├── dist/                   # Compiled JavaScript (production)
└── package.json
```

### Module Structure (MVC Pattern)

Each module follows this consistent structure:

```
module-name/
├── module-name.model.ts       # Mongoose schema & model
├── module-name.interface.ts   # TypeScript interfaces
├── module-name.validation.ts  # Zod validation schemas
├── module-name.controller.ts  # Request handlers
├── module-name.service.ts     # Business logic
├── module-name.routes.ts      # Express routes
└── module-name.utils.ts       # Module-specific utilities (optional)
```

---

## Features

### Core Features

- **Secure Authentication**
  - JWT-based authentication with refresh tokens
  - Password hashing with bcryptjs
  - Email verification system
  - Password reset via email

- **Role-Based Access Control (RBAC)**
  - Multiple user roles: `STUDENT`, `TEACHER`, `ALUMNI`, `ADMIN`
  - Granular permissions system
  - Middleware-based authorization checks

- **Email Service**
  - Automated email notifications
  - Template-based emails
  - Email logging for audit trails

- **File Management**
  - Image and PDF uploads
  - Cloudinary integration
  - Optimized storage and CDN delivery

- **Security**
  - Helmet.js for HTTP headers
  - Rate limiting to prevent abuse
  - CORS configuration
  - Input validation with Zod
  - MongoDB injection prevention

### Module-Specific Features

#### Authentication & User Management
- User registration with admin approval
- Email verification
- JWT access and refresh tokens
- Profile management
- Batch and session tracking

#### Finance Module
- Public financial transparency ledger
- Income/expense tracking with proof documents
- Category-based organization
- Permission-based entry creation

#### Society Management
- Hierarchical member ranking (1-5)
- Work assignment system
- Task tracking and status updates
- Member directory

#### Blog & Content
- Rich text editor support
- Image uploads
- Draft/published status
- Author attribution

#### Events & Notices
- Event creation and management
- Category filtering
- Date-based queries
- Important notices flagging

#### Alumni Network
- Graduate session tracking
- Career information
- Alumni directory
- Batch-wise filtering

#### Applications
- Application submission system
- Status tracking
- Admin review workflow

---

## Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** (Atlas or local instance)
- **Cloudinary Account** (for file uploads)
- **Gmail Account** (for email service)

### Installation

1. **Clone the repository**
   ```bash
   cd Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` with your actual credentials (see [Environment Variables](#-environment-variables))

4. **Seed admin user**
   ```bash
   npm run seed:admin
   ```
   This creates a default admin account for initial access.

5. **Start development server**
   ```bash
   npm run dev
   ```

The server will start at `http://localhost:5000` (or your configured PORT).

---

## Environment Variables

Create a `.env` file in the Backend directory with the following variables:

```bash
# Server Configuration
NODE_ENV=development              # development | production
PORT=5000                         # Server port

# Database
MONGODB_URI=your_mongodb_atlas_uri  # MongoDB connection string

# JWT Configuration
JWT_SECRET=your_random_secret_string              # Min 32 characters
JWT_EXPIRES_IN=1d                                 # Access token expiry
JWT_REFRESH_SECRET=your_random_refresh_secret     # Min 32 characters
JWT_REFRESH_EXPIRES_IN=30d                        # Refresh token expiry

# Cloudinary (File Storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Service (Gmail)
EMAIL_USER=your_gmail_address       # e.g., noreply@example.com
EMAIL_PASS=your_app_password        # Gmail App Password (not regular password)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587

# CORS Configuration
CLIENT_URL=http://localhost:3000,https://your-frontend-url.vercel.app
```

> **Security Notes:**
> - Never commit `.env` to version control
> - Use App Passwords for Gmail (enable 2FA first)
> - Generate strong random secrets for JWT keys
> - Use environment-specific URLs for CLIENT_URL

---

## Project Structure

```
Backend/
├── src/
│   ├── app.ts                    # Express app setup with middleware
│   ├── server.ts                 # Server initialization & error handlers
│   │
│   ├── config/
│   │   ├── env.ts                # Environment variable validation
│   │   ├── database.ts           # MongoDB connection
│   │   ├── cloudinary.ts         # Cloudinary configuration
│   │   └── email.ts              # Nodemailer setup
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts    # JWT verification & user authentication
│   │   ├── error.middleware.ts   # Global error handler
│   │   ├── validate.middleware.ts # Zod schema validation
│   │   └── upload.middleware.ts  # Multer file upload configuration
│   │
│   ├── modules/                  # Feature modules (see below)
│   │
│   ├── routes/
│   │   └── index.ts              # Aggregated API routes
│   │
│   ├── utils/
│   │   ├── ApiError.ts           # Custom error class
│   │   ├── catchAsync.ts         # Async error wrapper
│   │   ├── sendEmail.ts          # Email utility
│   │   ├── seedAdmin.util.ts     # Admin seeding
│   │   └── ... (other utilities)
│   │
│   └── tests/
│       └── ... (test files)
│
├── scripts/
│   └── seedAdmin.ts              # Standalone admin seeder script
│
├── dist/                         # Compiled TypeScript (production)
├── node_modules/
├── .env                          # Environment variables (not in git)
├── .env.example                  # Environment template
├── .gitignore
├── package.json
├── tsconfig.json                 # TypeScript configuration
├── jest.config.js                # Jest test configuration
└── README.md
```

---

## API Modules

The backend is organized into 15 feature modules:

| Module | Base Path | Description |
|--------|-----------|-------------|
| **Auth** | `/api/auth` | Registration, login, token refresh, password reset |
| **User** | `/api/users` | User profiles, listings, approval system |
| **Blog** | `/api/blogs` | Blog posts, comments, categories |
| **Content** | `/api/content` | CMS content (homepage, notices, banners) |
| **Event** | `/api/events` | Event management, categories, filtering |
| **Finance** | `/api/finance` | Income/expense tracking with proof documents |
| **Society** | `/api/society` | Society management, member hierarchy |
| **Alumni** | `/api/alumni` | Alumni directory, graduate sessions |
| **Academic** | `/api/academic` | Academic resources, faculty directory |
| **Payment** | `/api/payment` | Payment tracking and management |
| **Product** | `/api/products` | Product catalog |
| **Application** | `/api/applications` | Application submissions and reviews |
| **Work Assignment** | `/api/work-assignments` | Task assignment system |
| **Sports** | `/api/sports` | Sports activities and events |
| **Email Log** | `/api/email-logs` | Email audit trail |

### Common API Patterns

All modules follow RESTful conventions:

```
GET    /api/module          # Get all items (with pagination)
GET    /api/module/:id      # Get single item
POST   /api/module          # Create new item
PUT    /api/module/:id      # Update item
DELETE /api/module/:id      # Delete item
```

---

## Authentication & Authorization

### Authentication Flow

1. **Registration**
   ```
   POST /api/auth/register
   Body: { fullName, email, password, role, batch, session }
   → User created with status: PENDING
   ```

2. **Admin Approval**
   ```
   PUT /api/users/:id/approve
   → User status: APPROVED
   ```

3. **Login**
   ```
   POST /api/auth/login
   Body: { email, password }
   → Returns: { accessToken, refreshToken, user }
   ```

4. **Protected Routes**
   ```
   Authorization: Bearer <accessToken>
   ```

5. **Token Refresh**
   ```
   POST /api/auth/refresh-token
   Body: { refreshToken }
   → Returns: { accessToken }
   ```

### Authorization (RBAC)

The system uses middleware-based authorization:

```typescript
// Protect route (requires authentication)
router.get('/protected', auth, handler);

// Restrict to specific roles
router.post('/admin-only', auth, authorize('ADMIN'), handler);

// Multiple roles allowed
router.put('/edit', auth, authorize('ADMIN', 'TEACHER'), handler);
```

**User Roles:**
- `STUDENT` - Regular students
- `TEACHER` - Faculty members
- `ALUMNI` - Graduates
- `ADMIN` - Full system access

**Permission System:**
Users can have additional granular permissions:
- `MANAGE_BLOGS`
- `MANAGE_ACCOUNTS` (Finance)
- `MANAGE_SOCIETIES`
- `MANAGE_EVENTS`

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Run production server from `dist/` |
| `npm run lint` | Run ESLint on source files |
| `npm run lint:fix` | Auto-fix ESLint errors |
| `npm test` | Run Jest test suite |
| `npm run test:watch` | Run tests in watch mode |
| `npm run seed:admin` | Create default admin user |

---

## API Documentation

### Swagger UI

The API is documented using Swagger/OpenAPI. Once the server is running, access the interactive documentation at:

```
http://localhost:5000/api-docs
```

### Postman Collection

A Postman collection is available at `sust-cse-api.postman_collection.json`. Import it into Postman for easy API testing.

### Example API Calls

#### 1. Register a New User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@student.sust.edu",
  "password": "SecurePass123!",
  "role": "STUDENT",
  "batch": 21,
  "session": "2021-22"
}
```

#### 2. Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@student.sust.edu",
  "password": "SecurePass123!"
}
```

#### 3. Get All Blogs (Protected)
```bash
GET /api/blogs
Authorization: Bearer <your-access-token>
```

#### 4. Create Finance Entry
```bash
POST /api/finance
Authorization: Bearer <admin-token>
Content-Type: multipart/form-data

{
  "title": "Workshop Sponsorship",
  "amount": 50000,
  "type": "INCOME",
  "category": "SPONSORSHIP",
  "proof": <file>
}
```

---

## Testing

The project uses Jest and Supertest for testing.

### Running Tests

```bash
# Run all tests
npm test

# Run in watch mode
npm run test:watch

# Run with coverage
npm test -- --coverage
```

### Test Structure

```
src/tests/
├── unit/           # Unit tests for services, utils
├── integration/    # API integration tests
└── e2e/            # End-to-end tests
```

### Example Test

```typescript
describe('Auth API', () => {
  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
        role: 'STUDENT'
      });
    
    expect(response.status).toBe(201);
    expect(response.body.user.email).toBe('test@example.com');
  });
});
```

---

## Deployment

### Deployment Platforms

The backend can be deployed to:
- **Vercel** (Serverless)
- **Railway**
- **Render**
- **AWS EC2**
- **DigitalOcean**
- **Heroku**

### Vercel Deployment (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Configure `vercel.json`** (already included)
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "dist/server.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "dist/server.js"
       }
     ]
   }
   ```

3. **Build and Deploy**
   ```bash
   npm run build
   vercel --prod
   ```

4. **Set Environment Variables** in Vercel Dashboard
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env`

### Database Setup

**MongoDB Atlas** (Recommended):
1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Whitelist Vercel IP ranges (or use `0.0.0.0/0` for testing)
3. Copy the connection string to `MONGODB_URI`

### Post-Deployment

1. **Seed Admin User**
   ```bash
   # Run locally with production DB
   MONGODB_URI=<prod-db-uri> npm run seed:admin
   ```

2. **Test API**
   ```bash
   curl https://your-backend.vercel.app/api/health
   ```

---

## Troubleshooting

### Common Issues

**1. MongoDB Connection Failed**
```
Error: connect ECONNREFUSED
```
- Verify `MONGODB_URI` is correct
- Check database network access (whitelist IP)
- Ensure MongoDB cluster is running

**2. JWT Token Invalid**
```
Error: JsonWebTokenError: invalid signature
```
- Verify `JWT_SECRET` matches on both server and client
- Check token expiration
- Ensure token format: `Bearer <token>`

**3. File Upload Fails**
```
Error: Cloudinary upload failed
```
- Verify Cloudinary credentials
- Check file size limits (default 10MB)
- Ensure `upload` folder has write permissions

**4. Email Not Sending**
```
Error: Invalid login
```
- Use Gmail App Password (not regular password)
- Enable "Less secure app access" or use OAuth2
- Check firewall/network restrictions on port 587

---

## License

This project is licensed under the **ISC License**.

---

## Developer

**Lead Developer:** [Zubayer Hossain Uday](https://github.com/uday-zubayer)  
**Email:** uday.sust.cse@gmail.com

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Mongoose Guide](https://mongoosejs.com/docs/guide.html)
- [Zod Documentation](https://zod.dev/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

**Built with ❤️ for SUST CSE Department**
