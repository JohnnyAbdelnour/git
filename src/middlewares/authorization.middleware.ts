import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';

// Middleware to check if the authenticated user has the ADMIN role.
// This should be used *after* the isAuthenticated middleware.
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (req.session.user && req.session.user.role === Role.ADMIN) {
        next();
    } else {
        // You could redirect or just send a forbidden error.
        // For an API endpoint, a JSON response is more appropriate.
        res.status(403).json({ message: 'Forbidden: You do not have permission to perform this action.' });
    }
};