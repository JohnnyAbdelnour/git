import 'express-session';
import { User as PrismaUser } from '@prisma/client';

// We want to store the user object in the session, but without the password hash.
// This creates a new type that is the same as the Prisma User model, but omits the 'password' property.
type UserInSession = Omit<PrismaUser, 'password'>;

declare module 'express-session' {
  // This extends the existing SessionData interface from express-session.
  // Now, TypeScript will know that our session object can have a 'user' property of type 'UserInSession'.
  interface SessionData {
    user?: UserInSession;
  }
}