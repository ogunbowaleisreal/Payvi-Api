// Runs once before the test suite starts.
// jwt.utils.ts reads these from process.env at import time, so they
// must be set BEFORE any test file imports it.
process.env.ACCESS_TOKEN_SECRET = "test-access-secret";
process.env.REFRESH_TOKEN_SECRET = "test-refresh-secret";

// These services build external clients (Resend, Prisma/pg) inside their
// constructors, and controllers build those services inside THEIR
// constructors. That means simply importing a route file - which app.ts
// does at startup - constructs all of this, even though this test never
// calls email or the database. Dummy values are enough to satisfy the
// constructors so the app can load; the test below never actually sends
// an email or hits the DB.
process.env.RESEND_API_KEY = "re_test_dummy_key";
process.env.EMAIL_FROM = "test@example.com";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
