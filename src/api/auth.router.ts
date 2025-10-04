import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import prisma from '../utils/prisma';
import { verifyPassword } from '../services/auth.service';

const router = Router();

// Apply rate limiting to login attempts to prevent brute-force attacks
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many login attempts from this IP, please try again after 15 minutes',
});

// Validation rules for the login request
const loginValidationRules = [
  body('email').isEmail().withMessage('Enter a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Route: POST /api/auth/login
router.post('/login', loginLimiter, loginValidationRules, async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await verifyPassword(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Store user in session (excluding password)
    const { password: _, ...userToStore } = user;
    req.session.user = userToStore;

    res.status(200).json({ message: 'Login successful', user: userToStore });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Middleware to check if a user is authenticated
const isAuthenticated = (req: Request, res: Response, next) => {
  if (req.session.user) {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized: You must be logged in to access this resource.' });
  }
};

// Route: GET /api/auth/me
router.get('/me', isAuthenticated, (req: Request, res: Response) => {
  // The user object is attached to the session, added by the login route
  res.status(200).json({ user: req.session.user });
});

// Route: POST /api/auth/logout
router.post('/logout', (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Could not log out, please try again.' });
    }
    // Clears the cookie on the client side
    res.clearCookie('connect.sid'); // The default session cookie name is 'connect.sid'
    res.status(200).json({ message: 'Logout successful' });
  });
});

export default router;