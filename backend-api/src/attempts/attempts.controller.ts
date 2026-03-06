import { Controller, Post, Body, Get, Query, UseGuards } from '@nestjs/common';
import { AttemptsService } from './attempts.service';
import { Attempt } from './attempt.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/user.decorator';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('attempts')
export class AttemptsController {
  constructor(private readonly attemptsService: AttemptsService) {}

  // ✅ Create attempt (studentId auto from JWT)
  @Post()
  @UseGuards(JwtAuthGuard)
  createAttempt(@Body() data: Partial<Attempt>, @CurrentUser() user: any) {
    data.studentId = user.sub; // auto-fill studentId
    return this.attemptsService.createAttempt(data);
  }

  // ✅ Get attempts by student
  @Get('student/me')
  @UseGuards(JwtAuthGuard)
  getMyAttempts(@CurrentUser() user: any) {
    return this.attemptsService.findByStudent(user.sub);
  }

  // ✅ Get all attempts (Teacher)
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('teacher')
  findAll() {
    return this.attemptsService.findAll();
  }

  // 📊 Student Analytics
  @Get('analytics/me')
  @UseGuards(JwtAuthGuard)
  getMyAnalytics(@CurrentUser() user: any) {
    return this.attemptsService.getStudentAnalytics(user.sub);
  }

  // 📊 Teacher Analytics
  @Get('analytics/teacher')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('teacher')
  getTeacherAnalytics() {
    return this.attemptsService.getTeacherAnalytics();
  }

  // 🏆 Leaderboard
  @Get('leaderboard')
  getLeaderboard(@Query('topN') topN: string) {
    const limit = topN ? parseInt(topN) : 10;
    return this.attemptsService.getLeaderboard(limit);
  }
}