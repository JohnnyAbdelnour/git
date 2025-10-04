import express from 'express';
import session from 'express-session';
import connectSqlite3 from 'connect-sqlite3';
import path from 'path';
import csurf from 'csurf';
import methodOverride from 'method-override';

// Import routers
import authRouter from './api/auth.router';
import sliderRouter from './api/slider.router';
import announcementsRouter from './api/announcements.router';
import newsRouter from './api/news.router';
import projectsRouter from './api/projects.router';
import albumsRouter from './api/albums.router';
import imagesRouter from './api/images.router';
import servicesRouter from './api/services.router';
import formsRouter from './api/forms.router';
import settingsRouter from './api/settings.router';
import contactRouter from './api/contact.router';
import publishRouter from './api/publish.router';
import adminRouter from './web/admin.router';

const app = express();
const port = process.env.PORT || 8080;

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(methodOverride('_method'));

// Session management
const SQLiteStore = connectSqlite3(session);
app.use(
  session({
    store: new SQLiteStore({
      db: 'sessions.sqlite',
      dir: path.join(__dirname, '..', 'data'),
    }),
    secret: process.env.SESSION_SECRET || 'a-very-strong-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

// CSRF Protection
app.use(csurf({ cookie: true }));

// Routers
app.use('/api/auth', authRouter);
app.use('/api/slider', sliderRouter);
app.use('/api/announcements', announcementsRouter);
app.use('/api/news', newsRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/albums', albumsRouter);
app.use('/api/images', imagesRouter);
app.use('/api/services', servicesRouter);
app.use('/api/forms', formsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/contact', contactRouter);
app.use('/api/publish', publishRouter);
app.use('/admin', adminRouter);

// Root redirect
app.get('/', (req, res) => {
  res.redirect('/admin/dashboard');
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});