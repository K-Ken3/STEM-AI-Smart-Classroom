import { Controller, Post, Body, Get, HttpException, HttpStatus } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';

@Controller('questions')
export class QuestionsController {

  constructor(private readonly questionsService: QuestionsService) {}

  // ➕ Create a new question (solve + save)
  @Post()
  async create(@Body() dto: CreateQuestionDto) {
    try {
      const result = await this.questionsService.solve(dto.problem);

      return {
        success: true,
        message: 'Question solved successfully',
        data: result,
      };

    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to process question',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 📥 Get all questions
  @Get()
  async getAllQuestions() {
    try {
      const questions = await this.questionsService.findAll();

      return {
        success: true,
        count: questions.length,
        data: questions,
      };

    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch questions',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}