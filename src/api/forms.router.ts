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
const formValidationRules = [
    body('title').notEmpty().withMessage('Title is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('status').isIn(['DRAFT', 'PUBLISHED', 'ARCHIVED']).withMessage('Invalid status'),
    body('file_url').isURL().withMessage('A valid file URL is required'),
    body('version').optional().isString(),
];

// --- API Routes ---

// CREATE a new form
router.post('/', formValidationRules, async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { title, ...rest } = req.body;
        const slug = await generateUniqueSlug(prisma, 'form', title);

        await prisma.form.create({
            data: {
                title,
                slug,
                ...rest,
            },
        });
        res.redirect('/admin/forms');
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to create form.');
    }
});

// UPDATE a form
router.put('/:id', formValidationRules, async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { title, ...rest } = req.body;
        const slug = await generateUniqueSlug(prisma, 'form', title, req.params.id);

        await prisma.form.update({
            where: { id: req.params.id },
            data: {
                title,
                slug,
                ...rest,
            },
        });
        res.redirect('/admin/forms');
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to update form.');
    }
});

// DELETE a form
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        await prisma.form.delete({ where: { id: req.params.id } });
        res.redirect('/admin/forms');
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to delete form.');
    }
});

export default router;