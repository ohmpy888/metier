import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async create(blogId: number, dto: CreateCommentDto) {
    const blog = await this.prisma.blog.findUnique({
      where: { id: blogId },
    });
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    return this.prisma.comment.create({
      data: {
        blogId,
        senderName: dto.senderName,
        content: dto.content,
        isApproved: false,
      },
    });
  }

  async findAllAdmin() {
    return this.prisma.comment.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        blog: {
          select: {
            title: true,
            slug: true,
          },
        },
      },
    });
  }

  async approve(id: number) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
    });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return this.prisma.comment.update({
      where: { id },
      data: { isApproved: true },
    });
  }

  async reject(id: number) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
    });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return this.prisma.comment.update({
      where: { id },
      data: { isApproved: false },
    });
  }
}
