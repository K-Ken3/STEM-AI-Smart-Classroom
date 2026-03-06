import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ enum: ['student', 'teacher'], default: 'student' })
  role: string;

  // 👇 explicitly tell TS that _id exists and is ObjectId
  _id: Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(User);