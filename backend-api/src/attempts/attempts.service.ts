import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Attempt, AttemptDocument } from './attempt.schema';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { UsersService } from '../users/users.service';

@Injectable()
export class AttemptsService {
  constructor(
    @InjectModel(Attempt.name)
    private attemptModel: Model<AttemptDocument>,
    private httpService: HttpService,
    private usersService: UsersService,
  ) {}

  // ✅ Create attempt + call AI + auto-grade + attach studentId
  async createAttempt(data: Partial<Attempt>): Promise<Attempt> {
    if (!data.studentId) throw new Error('studentId is required');

    let aiResult: any;
    try {
      const response = await firstValueFrom(
        this.httpService.post('http://127.0.0.1:8000/solve', {
          problem: data.question,
        }),
      );
      aiResult = response.data;
    } catch (error) {
      console.error('AI service failed:', error.message);
      throw new Error('Failed to process AI solution');
    }

    const correctAnswer = aiResult.solution
      ? aiResult.solution.toString().trim()
      : '';

    const studentAnswer = data.studentAnswer
      ? data.studentAnswer.toString().trim()
      : '';

    const isCorrect =
      correctAnswer !== '' &&
      studentAnswer !== '' &&
      correctAnswer === studentAnswer;

    const attempt = new this.attemptModel({
      ...data,
      correctAnswer,
      aiSteps: aiResult.steps || [],
      topic: aiResult.topic || 'Algebra',
      isCorrect,
    });

    return attempt.save();
  }

  // ✅ Student: View own attempts
  async findByStudent(studentId: string): Promise<Attempt[]> {
    if (!Types.ObjectId.isValid(studentId)) throw new Error('Invalid student ID');
    return this.attemptModel.find({ studentId: new Types.ObjectId(studentId) });
  }

  // ✅ Teacher: View all attempts
  async findAll(): Promise<Attempt[]> {
    return this.attemptModel.find();
  }

  // 📊 Student Analytics
  async getStudentAnalytics(studentId: string) {
    if (!Types.ObjectId.isValid(studentId)) throw new Error('Invalid student ID');

    const attempts = await this.attemptModel.find({ studentId: new Types.ObjectId(studentId) });

    const totalAttempts = attempts.length;
    const correctAttempts = attempts.filter(a => a.isCorrect).length;
    const wrongAttempts = totalAttempts - correctAttempts;
    const accuracy = totalAttempts === 0 ? 0 : ((correctAttempts / totalAttempts) * 100).toFixed(2);

    const difficultyStats = { Easy: { total: 0, correct: 0 }, Medium: { total: 0, correct: 0 }, Hard: { total: 0, correct: 0 } };
    attempts.forEach(a => {
      if (difficultyStats[a.difficulty]) {
        difficultyStats[a.difficulty].total++;
        if (a.isCorrect) difficultyStats[a.difficulty].correct++;
      }
    });

    const topicStats: Record<string, { total: number; correct: number }> = {};
    attempts.forEach(a => {
      if (!topicStats[a.topic]) topicStats[a.topic] = { total: 0, correct: 0 };
      topicStats[a.topic].total++;
      if (a.isCorrect) topicStats[a.topic].correct++;
    });

    const weakTopics = Object.entries(topicStats)
      .filter(([_, val]) => val.correct / val.total < 0.5)
      .map(([topic]) => topic);

    return { totalAttempts, correctAttempts, wrongAttempts, accuracy: `${accuracy}%`, difficultyStats, topicStats, weakTopics };
  }

  // 🏆 Leaderboard: Top N students
  async getLeaderboard(topN: number = 10) {
    const attempts = await this.attemptModel.aggregate([
      { $group: { _id: '$studentId', totalAttempts: { $sum: 1 }, correctAttempts: { $sum: { $cond: ['$isCorrect', 1, 0] } } } },
      { $addFields: { accuracy: { $cond: [ { $eq: ['$totalAttempts', 0] }, 0, { $multiply: [{ $divide: ['$correctAttempts', '$totalAttempts'] }, 100] } ] } } },
      { $sort: { accuracy: -1, correctAttempts: -1 } },
      { $limit: topN },
    ]);

    const leaderboard = await Promise.all(
      attempts.map(async (a) => {
        const student = await this.usersService.findById(a._id);
        return {
          studentId: a._id,
          name: student?.name || 'Unknown',
          email: student?.email || '',
          totalAttempts: a.totalAttempts,
          correctAttempts: a.correctAttempts,
          accuracy: `${a.accuracy.toFixed(2)}%`,
        };
      }),
    );

    return leaderboard;
  }

  // 📊 Teacher Analytics (Class-wide stats)
  async getTeacherAnalytics() {
    const attempts = await this.attemptModel.find();

    const totalAttempts = attempts.length;
    const correctAttempts = attempts.filter(a => a.isCorrect).length;
    const wrongAttempts = totalAttempts - correctAttempts;
    const classAccuracy = totalAttempts === 0 ? 0 : ((correctAttempts / totalAttempts) * 100).toFixed(2);

    const difficultyStats = { Easy: { total: 0, correct: 0 }, Medium: { total: 0, correct: 0 }, Hard: { total: 0, correct: 0 } };
    attempts.forEach(a => {
      if (difficultyStats[a.difficulty]) {
        difficultyStats[a.difficulty].total++;
        if (a.isCorrect) difficultyStats[a.difficulty].correct++;
      }
    });

    const topicStats: Record<string, { total: number; correct: number }> = {};
    attempts.forEach(a => {
      if (!topicStats[a.topic]) topicStats[a.topic] = { total: 0, correct: 0 };
      topicStats[a.topic].total++;
      if (a.isCorrect) topicStats[a.topic].correct++;
    });

    const weakTopics = Object.entries(topicStats)
      .filter(([_, val]) => val.correct / val.total < 0.5)
      .map(([topic]) => topic);

    const studentStatsMap: Record<string, { total: number; correct: number; accuracy: string }> = {};
    attempts.forEach(a => {
      const id = a.studentId.toString();
      if (!studentStatsMap[id]) studentStatsMap[id] = { total: 0, correct: 0, accuracy: '0%' };
      studentStatsMap[id].total++;
      if (a.isCorrect) studentStatsMap[id].correct++;
    });
    Object.entries(studentStatsMap).forEach(([id, val]) => {
      val.accuracy = ((val.correct / val.total) * 100).toFixed(2) + '%';
    });

    return { totalAttempts, correctAttempts, wrongAttempts, classAccuracy: `${classAccuracy}%`, difficultyStats, topicStats, weakTopics, studentStats: studentStatsMap };
  }
}