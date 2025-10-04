import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { isAuthenticated } from '../middlewares/auth.middleware';
import prisma from '../utils/prisma';
import { generateUniqueSlug } from '../utils/slugify';
import methodOverride from 'method-override';

const router = Router();

// This middleware allows us to use PUT/DELETE methods in HTML forms
// by adding a `_method` query parameter.
router.use(methodOverride('_method'));
router.use(isAuthenticated);

// --- Validation Rules ---
const sliderValidationRules = [
    body('title').notEmpty().withMessage('Title is required'),
    body('image_url').isURL().withMessage('A valid image URL is required'),
    body('status').isIn(['DRAFT', 'PUBLISHED', 'ARCHIVED']).withMessage('Invalid status'),
    body('order').isInt({ min: 0 }).withMessage('Order must be a non-negative integer'),
    body('visible_from').isISO8601().toDate().withMessage('A valid start date is required'),
    body('visible_to').optional({ checkFalsy: true }).isISO8601().toDate().withMessage('Invalid end date'),
    body('cta_type').isIn(['NONE', 'INTERNAL', 'EXTERNAL']).withMessage('Invalid CTA type'),
];

// --- API Routes ---

// CREATE a new slide
router.post('/', sliderValidationRules, async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // In a real app, you'd render the form again with errors.
        // For now, we'll send a JSON response for simplicity.
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { title, ...rest } = req.body;
        const slug = await generateUniqueSlug(prisma, 'slider', title);

        await prisma.slider.create({
            data: {
                title,
                slug,
                ...rest,
            },
        });
        res.redirect('/admin/slider');
    } catch (error) {
        // Proper error handling needed
        res.status(500).send('Failed to create slide.');
    }
});

// UPDATE a slide
router.put('/:id', sliderValidationRules, async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { title, ...rest } = req.body;
        const slug = await generateUniqueSlug(prisma, 'slider', title, req.params.id);

        await prisma.slider.update({
            where: { id: req.params.id },
            data: {
                title,
                slug,
                ...rest,
            },
        });
        res.redirect('/admin/slider');
    } catch (error) {
        res.status(500).send('Failed to update slide.');
    }
});

// DELETE a slide
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        await prisma.slider.delete({ where: { id: req.params.id } });
        res.redirect('/admin/slider');
    } catch (error) {
        res.status(500).send('Failed to delete slide.');
    }
});

export default router;