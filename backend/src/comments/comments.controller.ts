import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './create-comment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post('blog/:blogId')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async addComment(
    @Param('blogId', ParseIntPipe) blogId: number,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.create(blogId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin')
  async getCommentsAdmin() {
    return this.commentsService.findAllAdmin();
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/approve')
  async approveComment(@Param('id', ParseIntPipe) id: number) {
    return this.commentsService.approve(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/reject')
  async rejectComment(@Param('id', ParseIntPipe) id: number) {
    return this.commentsService.reject(id);
  }
}
