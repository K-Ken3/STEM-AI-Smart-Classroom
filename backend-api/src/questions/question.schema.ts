import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type QuestionDocument = Question & Document;

@Schema({ timestamps: true })
export class Question {

  @Prop({ required: true })
  problem: string;

  @Prop()
  solution: string;

  @Prop([String])
  steps: string[];

  @Prop()
  topic: string;

}

export const QuestionSchema = SchemaFactory.createForClass(Question);