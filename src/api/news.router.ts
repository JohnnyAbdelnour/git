import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { isAuthenticated } from '../middlewares/auth.middleware';
import prisma from '../utils/prisma';
import { generateUniqueSlug } from '../utils/slugify';
import methodOverride from 'method-override';

const router = Router();

// Middlewares for this router
router.use(methodOverride('_method'));
router.use(isAuthenticated);

// --- Validation Rules ---
const newsValidationRules = [
    body('title').notEmpty().withMessage('Title is required'),
    body('body').notEmpty().withMessage('Body content is required'),
    body('status').isIn(['DRAFT', 'PUBLISHED', 'ARCHIVED']).withMessage('Invalid status'),
    body('published_at').isISO8601().toDate().withMessage('A valid publication date is required'),
    body('cover_image').isURL().withMessage('A valid cover image URL is required'),
    body('tags').optional().isString(),
    body('pin_home').toBoolean(),
];

// --- API Routes ---

// CREATE a new news article
router.post('/', newsValidationRules, async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { title, ...rest } = req.body;
        const slug = await generateUniqueSlug(prisma, 'news', title);

        await prisma.news.create({
            data: {
                title,
                slug,
                ...rest,
            },
        });
        res.redirect('/admin/news');
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to create news article.');
    }
});

// UPDATE a news article
router.put('/:id', newsValidationRules, async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { title, ...rest } = req.body;
        const slug = await generateUniqueSlug(prisma, 'news', title, req.params.id);

        await prisma.news.update({
            where: { id: req.params.id },
            data: {
                title,
                slug,
                ...rest,
            },
        });
        res.redirect('/admin/news');
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to update news article.');
    }
});

// DELETE a news article
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        await prisma.news.delete({ where: { id: req.params.id } });
        res.redirect('/admin/news');
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to delete news article.');
    }
});

export default router;