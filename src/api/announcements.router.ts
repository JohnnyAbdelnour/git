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
const announcementValidationRules = [
    body('title').notEmpty().withMessage('Title is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('body').notEmpty().withMessage('Body content is required'),
    body('status').isIn(['DRAFT', 'PUBLISHED', 'ARCHIVED']).withMessage('Invalid status'),
    body('start_date').isISO8601().toDate().withMessage('A valid start date is required'),
    body('end_date').optional({ checkFalsy: true }).isISO8601().toDate().withMessage('Invalid end date'),
    body('pin_home').toBoolean(),
];

// --- API Routes ---

// CREATE a new announcement
router.post('/', announcementValidationRules, async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { title, ...rest } = req.body;
        const slug = await generateUniqueSlug(prisma, 'announcement', title);

        await prisma.announcement.create({
            data: {
                title,
                slug,
                ...rest,
            },
        });
        res.redirect('/admin/announcements');
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to create announcement.');
    }
});

// UPDATE an announcement
router.put('/:id', announcementValidationRules, async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { title, ...rest } = req.body;
        const slug = await generateUniqueSlug(prisma, 'announcement', title, req.params.id);

        await prisma.announcement.update({
            where: { id: req.params.id },
            data: {
                title,
                slug,
                ...rest,
            },
        });
        res.redirect('/admin/announcements');
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to update announcement.');
    }
});

// DELETE an announcement
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        await prisma.announcement.delete({ where: { id: req.params.id } });
        res.redirect('/admin/announcements');
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to delete announcement.');
    }
});

export default router;