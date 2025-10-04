import { Router, Request, Response } from 'express';
import { isAuthenticated, isGuest } from '../middlewares/auth.middleware';
import { isAdmin } from '../middlewares/authorization.middleware';
import prisma from '../utils/prisma';

const router = Router();

// Route for the login page
router.get('/login', isGuest, (req: Request, res: Response) => {
  res.render('login', {
    csrfToken: req.csrfToken(),
    user: null
  });
});

// Route for the dashboard page
router.get('/dashboard', isAuthenticated, (req: Request, res: Response) => {
  res.render('dashboard', {
    user: req.session.user,
    csrfToken: req.csrfToken(),
    publish_status: req.query.publish_status,
    message: req.query.message
  });
});

// --- Slider Management ---
router.get('/slider', isAuthenticated, async (req: Request, res: Response) => {
  const slides = await prisma.slider.findMany({ orderBy: { order: 'asc' } });
  res.render('slider', {
    slides,
    csrfToken: req.csrfToken(),
    user: req.session.user,
  });
});

router.get('/slider/new', isAuthenticated, (req: Request, res: Response) => {
  res.render('slider-form', {
    slide: null,
    csrfToken: req.csrfToken(),
    user: req.session.user,
  });
});

router.get('/slider/:id/edit', isAuthenticated, async (req: Request, res: Response) => {
  const slide = await prisma.slider.findUnique({ where: { id: req.params.id } });
  res.render('slider-form', {
    slide,
    csrfToken: req.csrfToken(),
    user: req.session.user,
  });
});

// --- Announcement Management ---
router.get('/announcements', isAuthenticated, async (req: Request, res: Response) => {
    const announcements = await prisma.announcement.findMany({ orderBy: { createdAt: 'desc' } });
    res.render('announcements', {
        announcements,
        csrfToken: req.csrfToken(),
        user: req.session.user,
    });
});

router.get('/announcements/new', isAuthenticated, (req: Request, res: Response) => {
    res.render('announcement-form', {
        announcement: null,
        csrfToken: req.csrfToken(),
        user: req.session.user,
    });
});

router.get('/announcements/:id/edit', isAuthenticated, async (req: Request, res: Response) => {
    const announcement = await prisma.announcement.findUnique({ where: { id: req.params.id } });
    res.render('announcement-form', {
        announcement,
        csrfToken: req.csrfToken(),
        user: req.session.user,
    });
});

// --- News Management ---
router.get('/news', isAuthenticated, async (req: Request, res: Response) => {
    const news = await prisma.news.findMany({ orderBy: { published_at: 'desc' } });
    res.render('news', {
        news,
        csrfToken: req.csrfToken(),
        user: req.session.user,
    });
});

router.get('/news/new', isAuthenticated, (req: Request, res: Response) => {
    res.render('news-form', {
        article: null,
        csrfToken: req.csrfToken(),
        user: req.session.user,
    });
});

router.get('/news/:id/edit', isAuthenticated, async (req: Request, res: Response) => {
    const article = await prisma.news.findUnique({ where: { id: req.params.id } });
    res.render('news-form', {
        article,
        csrfToken: req.csrfToken(),
        user: req.session.user,
    });
});

// --- Project Management ---
router.get('/projects', isAuthenticated, async (req: Request, res: Response) => {
    const projects = await prisma.project.findMany({ orderBy: { start_date: 'desc' } });
    res.render('projects', {
        projects,
        csrfToken: req.csrfToken(),
        user: req.session.user,
    });
});

router.get('/projects/new', isAuthenticated, (req: Request, res: Response) => {
    res.render('project-form', {
        project: null,
        csrfToken: req.csrfToken(),
        user: req.session.user,
    });
});

router.get('/projects/:id/edit', isAuthenticated, async (req: Request, res: Response) => {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    res.render('project-form', {
        project,
        csrfToken: req.csrfToken(),
        user: req.session.user,
    });
});

// --- Gallery (Album) Management ---
router.get('/gallery', isAuthenticated, async (req: Request, res: Response) => {
    const albums = await prisma.album.findMany({
        orderBy: { createdAt: 'desc' },
        include: { images: true }
    });
    res.render('gallery', {
        albums,
        csrfToken: req.csrfToken(),
        user: req.session.user,
    });
});

router.get('/gallery/new', isAuthenticated, (req: Request, res: Response) => {
    res.render('album-form', {
        album: null,
        csrfToken: req.csrfToken(),
        user: req.session.user,
    });
});

router.get('/gallery/:id/edit', isAuthenticated, async (req: Request, res: Response) => {
    const album = await prisma.album.findUnique({
        where: { id: req.params.id },
        include: { images: true }
    });
    res.render('album-form', {
        album,
        csrfToken: req.csrfToken(),
        user: req.session.user,
    });
});

// --- Service Management ---
router.get('/services', isAuthenticated, async (req: Request, res: Response) => {
    const services = await prisma.service.findMany({ orderBy: { createdAt: 'desc' } });
    res.render('services', {
        services,
        csrfToken: req.csrfToken(),
        user: req.session.user,
    });
});

router.get('/services/new', isAuthenticated, (req: Request, res: Response) => {
    res.render('service-form', {
        service: null,
        csrfToken: req.csrfToken(),
        user: req.session.user,
    });
});

router.get('/services/:id/edit', isAuthenticated, async (req: Request, res: Response) => {
    const service = await prisma.service.findUnique({ where: { id: req.params.id } });
    res.render('service-form', {
        service,
        csrfToken: req.csrfToken(),
        user: req.session.user,
    });
});

// --- Form (PDF) Management ---
router.get('/forms', isAuthenticated, async (req: Request, res: Response) => {
    const forms = await prisma.form.findMany({ orderBy: { createdAt: 'desc' } });
    res.render('forms', {
        forms,
        csrfToken: req.csrfToken(),
        user: req.session.user,
    });
});

router.get('/forms/new', isAuthenticated, (req: Request, res: Response) => {
    res.render('form-form', {
        form: null,
        csrfToken: req.csrfToken(),
        user: req.session.user,
    });
});

router.get('/forms/:id/edit', isAuthenticated, async (req: Request, res: Response) => {
    const form = await prisma.form.findUnique({ where: { id: req.params.id } });
    res.render('form-form', {
        form,
        csrfToken: req.csrfToken(),
        user: req.session.user,
    });
});

// --- Site Settings ---
router.get('/settings', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    let settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
    if (!settings) {
        settings = await prisma.siteSettings.create({ data: { id: 1 } });
    }
    res.render('settings', {
        settings: {
            ...settings,
            social: settings.social || {},
            about: settings.about || {},
            contact: settings.contact || {},
        },
        csrfToken: req.csrfToken(),
        user: req.session.user,
    });
});

// --- Media Library ---
router.get('/media', isAuthenticated, async (req: Request, res: Response) => {
    const images = await prisma.image.findMany({ orderBy: { createdAt: 'desc' } });
    res.render('media-library', {
        images,
        csrfToken: req.csrfToken(),
        user: req.session.user,
    });
});

// --- Contact Message Inbox ---
router.get('/messages', isAuthenticated, async (req, res) => {
    const messages = await prisma.contactMessage.findMany({ orderBy: { received_at: 'desc' } });
    res.render('messages', {
        messages,
        csrfToken: req.csrfToken(),
        user: req.session.user,
    });
});

router.get('/messages/:id', isAuthenticated, async (req, res) => {
    const message = await prisma.contactMessage.findUnique({ where: { id: req.params.id } });
    if (!message) {
        return res.status(404).send('Message not found');
    }
    await prisma.contactMessage.update({
        where: { id: req.params.id },
        data: { processed: true },
    });
    res.render('message-detail', {
        message,
        csrfToken: req.csrfToken(),
        user: req.session.user,
    });
});

// --- User Management ---
router.get('/users', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
    res.render('users', {
        users,
        currentUser: req.session.user,
        csrfToken: req.csrfToken(),
        user: req.session.user,
    });
});

router.get('/users/new', isAuthenticated, isAdmin, (req: Request, res: Response) => {
    res.render('user-form', {
        userToEdit: null,
        csrfToken: req.csrfToken(),
        user: req.session.user,
    });
});

router.get('/users/:id/edit', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    const userToEdit = await prisma.user.findUnique({ where: { id: req.params.id } });
    res.render('user-form', {
        userToEdit,
        csrfToken: req.csrfToken(),
        user: req.session.user,
    });
});

export default router;