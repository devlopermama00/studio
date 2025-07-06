
import mongoose, { Schema, Document, models, Types } from 'mongoose';

export interface INotice extends Document {
  title: string;
  content: string;
  author: Types.ObjectId;
  target: 'provider' | 'user' | 'all';
  createdAt: Date;
}

const NoticeSchema: Schema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  target: { type: String, enum: ['provider', 'user', 'all'], default: 'provider' },
}, { timestamps: true });

export default models.Notice || mongoose.model<INotice>('Notice', NoticeSchema);
