import { Request, Response, NextFunction } from 'express';

// Middleware to check if a user is authenticated
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.session.user) {
    next();
  } else {
    // Redirect to login page if not authenticated.
    // This is more appropriate for web routes than sending a 401 JSON response.
    res.redirect('/admin/login');
  }
};

// Middleware to redirect to dashboard if already logged in
export const isGuest = (req: Request, res: Response, next: NextFunction) => {
  if (req.session.user) {
    res.redirect('/admin/dashboard');
  } else {
    next();
  }
};