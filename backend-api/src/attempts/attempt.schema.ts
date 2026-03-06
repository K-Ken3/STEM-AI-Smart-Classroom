import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AttemptDocument = Attempt & Document;

@Schema({ timestamps: true })
export class Attempt {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  studentId: Types.ObjectId;

  @Prop({ required: true })
  question: string;

  @Prop({ required: true })
  studentAnswer: string;

  @Prop()
  correctAnswer: string;

  @Prop()
  recognizedText: string; // From OCR or speech

  @Prop()
  topic: string;

  @Prop({ default: 'Medium' })
  difficulty: string;

  @Prop({ default: false })
  isCorrect: boolean;

  @Prop({ type: [String] })
  aiSteps: string[]; // Step-by-step solution
}

export const AttemptSchema = SchemaFactory.createForClass(Attempt);