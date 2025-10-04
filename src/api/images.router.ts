import { Router, Request, Response } from 'express';
import { isAuthenticated } from '../middlewares/auth.middleware';
import prisma from '../utils/prisma';
import { upload, resizeImage } from '../services/media.service';
import methodOverride from 'method-override';
import fs from 'fs';
import path from 'path';

const router = Router();

// Middlewares
router.use(methodOverride('_method'));
router.use(isAuthenticated);

// Route to handle image upload for a specific album
// The 'news' preset is used here as a generic large image size.
router.post('/upload/:albumId', upload.single('image'), resizeImage('news'), async (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).send('No image file uploaded.');
    }

    const { albumId } = req.params;
    const { caption, alt, credit } = req.body;

    try {
        const album = await prisma.album.findUnique({ where: { id: albumId } });
        if (!album) {
            // If album not found, delete the uploaded file
            fs.unlinkSync(req.file.path);
            return res.status(404).send('Album not found.');
        }

        await prisma.image.create({
            data: {
                file_url: `/uploads/${req.file.filename}`, // URL to access the file
                caption: caption || '',
                alt: alt || '',
                credit: credit || '',
                albumId: albumId,
            },
        });

        // Redirect back to the album edit page
        res.redirect(`/admin/gallery/${albumId}/edit`);

    } catch (error) {
        console.error('Failed to upload image:', error);
        res.status(500).send('Failed to process image upload.');
    }
});

// Route to delete an image
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const image = await prisma.image.findUnique({ where: { id: req.params.id } });
        if (!image) {
            return res.status(404).send('Image not found.');
        }

        // Delete the physical file from the uploads directory
        const filePath = path.join(__dirname, '..', '..', image.file_url);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await prisma.image.delete({ where: { id: req.params.id } });

        // Redirect back to the album edit page, if albumId is present
        if (image.albumId) {
            res.redirect(`/admin/gallery/${image.albumId}/edit`);
        } else {
            res.redirect('/admin/gallery');
        }

    } catch (error) {
        console.error('Failed to delete image:', error);
        res.status(500).send('Failed to delete image.');
    }
});

export default router;