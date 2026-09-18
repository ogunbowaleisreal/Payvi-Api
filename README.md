# Payvi

Payvi is a fintech platform built with **TypeScript, Node.js, Express, and PostgreSQL**.

The platform currently provides **airtime and data services**, with plans to expand into additional digital financial and utility services.

---

## Overview

Payvi provides users with a simple platform for purchasing digital services such as:

* Airtime
* Mobile data
* More financial and digital services coming soon

The backend is designed with scalability, maintainability, and clear separation of concerns in mind, allowing new products and services to be added without disrupting the existing architecture.

---

## Tech Stack

* **Node.js**
* **Express**
* **TypeScript**
* **PostgreSQL**
* **Prisma ORM**
* **Redis**
* **JWT Authentication**
* **REST API**

---

## Architecture

Payvi follows a layered **Controller-Service-Repository architecture**.

```text
HTTP Request
     ↓
   Route
     ↓
 Controller
     ↓
  Service
     ↓
 Repository
     ↓
 PostgreSQL
```

This separation keeps business logic, HTTP handling, and database access independent and easier to maintain.

---

## Project Structure

```text
src/
├── app.ts
├── server.ts
│
├── config/
│   ├── database.ts
│   ├── prisma.ts
│   ├── redis.ts
│   └── email.ts
│
├── controller/
│
├── interfaces/
│
├── middleware/
│
├── repository/
│
├── routes/
│
├── services/
│
├── utils/
│
├── templates/
│   └── email/
│
└── generated/
    └── prisma/

prisma/
├── schema.prisma
├── seed.ts
└── migrations/
```

---

## Core Features

### Authentication & Authorization

Payvi includes a reusable authentication and authorization system supporting:

* User authentication
* Admin authentication
* JWT-based authentication
* Session management
* Role-based access control
* Permission-based admin authorization
* Password hashing
* OTP verification

### Airtime & Data

The current core functionality of Payvi focuses on digital mobile services:

* Airtime purchases
* Data purchases
* Transaction processing
* Service-provider integrations

Additional services and financial products will be introduced as the platform evolves.

### Redis

Redis is used for short-lived and performance-sensitive data such as:

* OTPs
* Temporary verification data
* Caching
* Expiration-based records

### Email

The backend includes an email service for transactional communication such as:

* OTP emails
* Account-related notifications
* Other system emails

---

## Database

Payvi uses **PostgreSQL** as its primary database with **Prisma ORM** for database access.

The project uses Prisma migrations to manage database schema changes across development and deployment environments.

```text
Application
     ↓
Repository
     ↓
Prisma
     ↓
PostgreSQL
```

---

## API

Payvi exposes a RESTful API consumed by the application's frontend and other authorized clients.

The API is organized around domain-specific routes and follows the project's layered architecture.

---

## Development

Install dependencies:

```bash
npm install
```

Generate the Prisma client:

```bash
npx prisma generate
```

Run database migrations:

```bash
npx prisma migrate dev
```

Start the development server:

```bash
npm run dev
```

---

## Environment Variables

Create a `.env` file containing the required environment variables for:

* PostgreSQL
* JWT
* Redis
* Email service
* External service integrations

Example:

```env
DATABASE_URL=
REDIS_URL=

JWT_SECRET=
JWT_REFRESH_SECRET=

EMAIL_API_KEY=
```

Never commit production credentials or secrets to the repository.

---

## Project Status

Payvi is currently focused on **airtime and data services**.

The platform is actively being developed, with additional fintech and digital services planned for future releases.

---

## License

This project is proprietary software.
