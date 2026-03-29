import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {

  constructor(private readonly aiService: AiService) {}

  @Post('solve')
  solve(@Body('problem') problem: string) {
    return this.aiService.solve(problem);
  }
}