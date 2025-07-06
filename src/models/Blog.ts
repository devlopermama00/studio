
import mongoose, { Schema, Document, models, Types } from 'mongoose';

export interface IBlog extends Document {
  title: string;
  content: string;
  featureImage?: string;
  author: Types.ObjectId;
  category?: Types.ObjectId;
  tags?: string[];
  published: boolean;
  publishedAt?: Date;
}

const BlogSchema: Schema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  featureImage: { type: String },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category' },
  tags: [{ type: String }],
  published: { type: Boolean, default: false },
  publishedAt: { type: Date },
}, { timestamps: true });

export default models.Blog || mongoose.model<IBlog>('Blog', BlogSchema);
