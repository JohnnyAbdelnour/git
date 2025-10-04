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
const serviceValidationRules = [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('status').isIn(['DRAFT', 'PUBLISHED', 'ARCHIVED']).withMessage('Invalid status'),
    body('icon').optional({ checkFalsy: true }).isURL().withMessage('Icon must be a valid URL'),
    body('requirements').optional().isString(),
    body('documents').optional().isString(),
    body('contact_person').optional().isString(),
    body('contact_phone').optional().isString(),
];

// --- API Routes ---

// CREATE a new service
router.post('/', serviceValidationRules, async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { title, ...rest } = req.body;
        const slug = await generateUniqueSlug(prisma, 'service', title);

        await prisma.service.create({
            data: {
                title,
                slug,
                ...rest,
            },
        });
        res.redirect('/admin/services');
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to create service.');
    }
});

// UPDATE a service
router.put('/:id', serviceValidationRules, async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { title, ...rest } = req.body;
        const slug = await generateUniqueSlug(prisma, 'service', title, req.params.id);

        await prisma.service.update({
            where: { id: req.params.id },
            data: {
                title,
                slug,
                ...rest,
            },
        });
        res.redirect('/admin/services');
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to update service.');
    }
});

// DELETE a service
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        await prisma.service.delete({ where: { id: req.params.id } });
        res.redirect('/admin/services');
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to delete service.');
    }
});

export default router;