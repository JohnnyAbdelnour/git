import { PrismaClient } from '@prisma/client';
import { promises as fs }
from 'fs';
import path from 'path';
import simpleGit from 'simple-git';

const prisma = new PrismaClient();

export class PublishingService {
  private publicRepoPath: string;
  private publishDataPath: string;

  constructor(publicRepoPath: string, publishDataPath: string) {
    this.publicRepoPath = publicRepoPath;
    this.publishDataPath = publishDataPath;
  }

  async publish(): Promise<void> {
    await this.generateJsonFiles();
    await this.commitAndPush();
  }

  private async generateJsonFiles(): Promise<void> {
    const [posts, pages, settings, galleryAlbums, galleryImages] = await Promise.all([
      prisma.post.findMany(),
      prisma.page.findMany(),
      prisma.settings.findFirst(),
      prisma.galleryAlbum.findMany(),
      prisma.galleryImage.findMany(),
    ]);

    await fs.mkdir(this.publishDataPath, { recursive: true });

    await Promise.all([
      fs.writeFile(path.join(this.publishDataPath, 'posts.json'), JSON.stringify(posts, null, 2)),
      fs.writeFile(path.join(this.publishDataPath, 'pages.json'), JSON.stringify(pages, null, 2)),
      fs.writeFile(path.join(this.publishDataPath, 'settings.json'), JSON.stringify(settings, null, 2)),
      fs.writeFile(path.join(this.publishData_path, 'gallery_albums.json'), JSON.stringify(galleryAlbums, null, 2)),
      fs.writeFile(path.join(this.publishDataPath, 'gallery_images.json'), JSON.stringify(galleryImages, null, 2)),
    ]);
  }

  private async commitAndPush(): Promise<void> {
    const git = simpleGit(this.publicRepoPath);
    await git.add('./*');
    await git.commit('chore(cms): content update');
    await git.push('origin', 'main');
  }
}