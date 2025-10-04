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
const projectValidationRules = [
    body('title').notEmpty().withMessage('Title is required'),
    body('body').notEmpty().withMessage('Body content is required'),
    body('status').isIn(['PLANNING', 'ONGOING', 'COMPLETED']).withMessage('Invalid status'),
    body('start_date').isISO8601().toDate().withMessage('A valid start date is required'),
    body('end_date').optional({ checkFalsy: true }).isISO8601().toDate().withMessage('Invalid end date'),
    body('cover_image').isURL().withMessage('A valid cover image URL is required'),
    body('pin_home').toBoolean(),
];

// --- API Routes ---

// CREATE a new project
router.post('/', projectValidationRules, async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { title, ...rest } = req.body;
        const slug = await generateUniqueSlug(prisma, 'project', title);

        await prisma.project.create({
            data: {
                title,
                slug,
                ...rest,
            },
        });
        res.redirect('/admin/projects');
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to create project.');
    }
});

// UPDATE a project
router.put('/:id', projectValidationRules, async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { title, ...rest } = req.body;
        const slug = await generateUniqueSlug(prisma, 'project', title, req.params.id);

        await prisma.project.update({
            where: { id: req.params.id },
            data: {
                title,
                slug,
                ...rest,
            },
        });
        res.redirect('/admin/projects');
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to update project.');
    }
});

// DELETE a project
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        await prisma.project.delete({ where: { id: req.params.id } });
        res.redirect('/admin/projects');
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to delete project.');
    }
});

export default router;