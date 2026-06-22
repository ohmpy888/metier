import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class BlogsService {
  constructor(private prisma: PrismaService) {}

  async findAllPublic(page: number = 1, search?: string) {
    const take = 10;
    const skip = (page - 1) * take;

    const where: Prisma.BlogWhereInput = {
      isPublished: true,
    };

    if (search) {
      where.title = {
        contains: search,
        mode: 'insensitive',
      };
    }

    const [blogs, total] = await Promise.all([
      this.prisma.blog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.blog.count({ where }),
    ]);

    return {
      blogs,
      total,
      page,
      totalPages: Math.ceil(total / take),
    };
  }

  async findAllAdmin(page: number = 1, search?: string) {
    const take = 10;
    const skip = (page - 1) * take;

    const where: Prisma.BlogWhereInput = {};

    if (search) {
      where.title = {
        contains: search,
        mode: 'insensitive',
      };
    }

    const [blogs, total] = await Promise.all([
      this.prisma.blog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.blog.count({ where }),
    ]);

    return {
      blogs,
      total,
      page,
      totalPages: Math.ceil(total / take),
    };
  }

  async findBySlug(slug: string) {
    const blog = await this.prisma.blog.findUnique({
      where: { slug },
      include: {
        comments: {
          where: { isApproved: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    const updatedBlog = await this.prisma.blog.update({
      where: { id: blog.id },
      data: { views: { increment: 1 } },
      include: {
        comments: {
          where: { isApproved: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return updatedBlog;
  }

  async create(data: {
    title: string;
    slug: string;
    summary: string;
    content: string;
    coverImage: string;
    additionalImages: string[];
    isPublished?: boolean;
  }) {
    const existing = await this.prisma.blog.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      throw new ConflictException('Slug already exists');
    }

    if (data.additionalImages.length > 6) {
      throw new ConflictException(
        'Additional images limit exceeded (maximum 6)',
      );
    }

    return this.prisma.blog.create({
      data: {
        title: data.title,
        slug: data.slug,
        summary: data.summary,
        content: data.content,
        coverImage: data.coverImage,
        additionalImages: JSON.stringify(data.additionalImages),
        isPublished: data.isPublished !== undefined ? data.isPublished : true,
      },
    });
  }

  async update(
    id: number,
    data: {
      title: string;
      slug: string;
      summary: string;
      content: string;
      coverImage: string;
      additionalImages: string[];
      isPublished?: boolean;
    },
  ) {
    const existingSlug = await this.prisma.blog.findUnique({
      where: { slug: data.slug },
    });

    if (existingSlug && existingSlug.id !== id) {
      throw new ConflictException('Slug already exists');
    }

    if (data.additionalImages.length > 6) {
      throw new ConflictException(
        'Additional images limit exceeded (maximum 6)',
      );
    }

    return this.prisma.blog.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        summary: data.summary,
        content: data.content,
        coverImage: data.coverImage,
        additionalImages: JSON.stringify(data.additionalImages),
        isPublished: data.isPublished,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.blog.delete({
      where: { id },
    });
  }
}
