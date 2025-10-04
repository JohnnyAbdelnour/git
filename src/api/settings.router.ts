import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { isAuthenticated, isAdmin } from '../middlewares/auth.middleware';
import prisma from '../utils/prisma';
import methodOverride from 'method-override';

const router = Router();

// Middlewares for this router
router.use(methodOverride('_method'));
router.use(isAuthenticated, isAdmin);

const settingsValidationRules = [
  body('site_name').notEmpty().withMessage('Site name is required'),
  body('logo_url').isURL().withMessage('Invalid URL for logo'),
  // Add more validation rules as needed for other settings
];

// GET settings
router.get('/', async (req: Request, res: Response) => {
    try {
        const settings = await prisma.siteSettings.findFirst();
        res.render('settings', {
            settings: settings || {},
            user: req.session.user,
            csrfToken: req.csrfToken(),
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching settings');
    }
});

// UPDATE settings
router.post('/', settingsValidationRules, async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const settings = await prisma.siteSettings.findFirst();
        return res.render('settings', {
            errors: errors.array(),
            settings: settings || {},
            user: req.session.user,
            csrfToken: req.csrfToken(),
        });
    }

    try {
        const { site_name, logo_url, about_title, about_text, contact_address, contact_phone, contact_email, facebook_url, twitter_url, instagram_url } = req.body;
        const settingsData = {
            site_name,
            logo_url,
            about: {
                title: about_title,
                text: about_text,
            },
            contact: {
                address: contact_address,
                phone: contact_phone,
                email: contact_email,
            },
            social: {
                facebook: facebook_url,
                twitter: twitter_url,
                instagram: instagram_url,
            },
        };

        const updatedSettings = await prisma.siteSettings.upsert({
            where: { id: 1 },
            update: settingsData,
            create: { id: 1, ...settingsData },
        });

        res.redirect('/admin/settings?success=true');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating settings');
    }
});


export default router;