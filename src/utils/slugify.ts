// A simple function to generate a URL-friendly slug from a string.
// It converts the string to lowercase, replaces spaces with hyphens,
// and removes any characters that are not letters, numbers, or hyphens.
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-');        // Replace multiple - with single -
}

// A function to generate a unique slug.
// If the initial slug already exists in the database, it appends a number.
// This requires a Prisma client instance and the model name to be passed in.
export async function generateUniqueSlug(
  prisma: any,
  model: string,
  title: string,
  idToExclude?: string
): Promise<string> {
  let slug = slugify(title);
  let isUnique = false;
  let counter = 1;

  while (!isUnique) {
    const whereClause: any = { slug };
    if (idToExclude) {
      whereClause.id = { not: idToExclude };
    }

    const existing = await prisma[model].findUnique({ where: whereClause });

    if (existing) {
      slug = `${slugify(title)}-${counter}`;
      counter++;
    } else {
      isUnique = true;
    }
  }

  return slug;
}