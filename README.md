# Backend Starter

A reusable, production-oriented TypeScript backend starter built with Node.js and Express.

The project follows a **layered Controller-Service-Repository architecture**, with a focus on clean separation of concerns, reusable authentication, authorization, and database access.

---

## Architecture

The application follows a layered architecture:

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
 Database


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
│   ├── user.controller.ts
│   ├── account.controller.ts
│   ├── admin-auth.controller.ts
│   └── admin-role.controller.ts
│
├── interfaces/
│   ├── user.interface.ts
│   ├── otp.interface.ts
│   ├── admin-auth.interface.ts
│   └── admin-role.interface.ts
│
├── middleware/
│   ├── auth.middleware.ts
│   └── admin-permission.middleware.ts
│
├── repository/
│   ├── user.repository.ts
│   ├── session.repository.ts
│   ├── admin.repository.ts
│   ├── admin-session.repository.ts
│   ├── admin-role.repository.ts
│   ├── admin-permission.repository.ts
│   └── admin-role-permission.repository.ts
│
├── routes/
│   ├── user.routes.ts
│   ├── admin.routes.ts
│   ├── admin-role.routes.ts
│   └── user/
│       ├── auth.routes.ts
│       └── account.routes.ts
│
├── services/
│   ├── user.service.ts
│   ├── account.service.ts
│   ├── admin-auth.service.ts
│   ├── admin-role.service.ts
│   ├── redis.service.ts
│   ├── otp.service.ts
│   └── email.service.ts
│
├── utils/
│   ├── app-error.ts
│   ├── jwt.utils.ts
│   ├── password.utils.ts
│   ├── token.utils.ts
│   └── response.utils.ts
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
