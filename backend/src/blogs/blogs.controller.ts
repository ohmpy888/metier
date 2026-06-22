import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @Get()
  async getPublicBlogs(
    @Query('page') page?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    return this.blogsService.findAllPublic(pageNum, search);
  }

  @Get('detail/:slug')
  async getBlogBySlug(@Param('slug') slug: string) {
    return this.blogsService.findBySlug(slug);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin')
  async getAdminBlogs(
    @Query('page') page?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    return this.blogsService.findAllAdmin(pageNum, search);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createBlog(
    @Body()
    body: {
      title: string;
      slug: string;
      summary: string;
      content: string;
      coverImage: string;
      additionalImages: string[];
      isPublished?: boolean;
    },
  ) {
    return this.blogsService.create(body);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateBlog(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      title: string;
      slug: string;
      summary: string;
      content: string;
      coverImage: string;
      additionalImages: string[];
      isPublished?: boolean;
    },
  ) {
    return this.blogsService.update(id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteBlog(@Param('id', ParseIntPipe) id: number) {
    return this.blogsService.remove(id);
  }
}
