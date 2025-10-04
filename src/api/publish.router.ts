import { Router } from 'express';
import { PublishingService } from '../services/PublishService';
import { isAuthenticated } from '../middleware/auth.middleware';

const router = Router();

router.post('/', isAuthenticated, async (req, res) => {
  try {
    const publicRepoPath = process.env.PUBLIC_REPO_PATH || '../public-repo';
    const publishDataPath = `${publicRepoPath}/data`;

    const publishingService = new PublishingService(publicRepoPath, publishDataPath);
    await publishingService.publish();
    res.status(200).json({ message: 'Content published successfully' });
  } catch (error) {
    console.error('Error publishing content:', error);
    res.status(500).json({ message: 'Failed to publish content' });
  }
});

export default router;