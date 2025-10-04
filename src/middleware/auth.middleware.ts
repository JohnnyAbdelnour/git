import { Request, Response, NextFunction } from 'express';

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
};

export const isGuest = (req: Request, res: Response, next: NextFunction) => {
  if (req.session.user) {
    res.redirect('/admin/dashboard');
  } else {
    next();
  }
};