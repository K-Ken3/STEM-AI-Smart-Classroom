import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Question } from './question.schema';
import { AiService } from '../ai/ai.service';

@Injectable()
export class QuestionsService {

  constructor(
    @InjectModel(Question.name)
    private questionModel: Model<Question>,
    private aiService: AiService,
  ) {}

  async solve(problem: string) {

    const aiResult = await this.aiService.solve(problem);

    const newQuestion = new this.questionModel({
      problem: problem,
      solution: aiResult.solution,
      steps: aiResult.steps,
      topic: aiResult.topic
    });

    await newQuestion.save();

    return newQuestion;
  }

  async findAll() {
    return this.questionModel.find().sort({ createdAt: -1 });
  }
}