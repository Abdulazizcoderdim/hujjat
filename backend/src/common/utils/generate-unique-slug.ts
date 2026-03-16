import slugify from 'slugify';
import { ILike, Not, Repository } from 'typeorm';

export async function generateUniqueSlug(
  repo: Repository<any>,
  name: string,
  excludeId?: number,
): Promise<string> {
  const baseSlug = slugify(name, { lower: true, strict: true });

  const where: any = {
    slug: ILike(`${baseSlug}%`),
  };

  if (excludeId) {
    where.id = Not(excludeId);
  }

  const existing = await repo.find({
    where,
    select: { slug: true },
  });

  if (existing.length === 0) {
    return baseSlug;
  }

  const regex = new RegExp(`^${baseSlug}(?:-(\\d+))?$`);

  let max = 1;

  for (const item of existing) {
    const match = item.slug.match(regex);
    if (match?.[1]) {
      const num = parseInt(match[1], 10);
      if (num > max) max = num;
    }
  }

  return `${baseSlug}-${max + 1}`;
}
