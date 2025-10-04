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
const albumValidationRules = [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').optional().isString(),
    body('cover_image').isURL().withMessage('A valid cover image URL is required'),
    body('status').isIn(['DRAFT', 'PUBLISHED', 'ARCHIVED']).withMessage('Invalid status'),
];

// --- API Routes ---

// CREATE a new album
router.post('/', albumValidationRules, async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { title, ...rest } = req.body;
        const slug = await generateUniqueSlug(prisma, 'album', title);

        await prisma.album.create({
            data: {
                title,
                slug,
                ...rest,
            },
        });
        res.redirect('/admin/gallery');
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to create album.');
    }
});

// UPDATE an album
router.put('/:id', albumValidationRules, async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { title, ...rest } = req.body;
        const slug = await generateUniqueSlug(prisma, 'album', title, req.params.id);

        await prisma.album.update({
            where: { id: req.params.id },
            data: {
                title,
                slug,
                ...rest,
            },
        });
        res.redirect('/admin/gallery');
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to update album.');
    }
});

// DELETE an album
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        await prisma.album.delete({ where: { id: req.params.id } });
        res.redirect('/admin/gallery');
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to delete album.');
    }
});

export default router;