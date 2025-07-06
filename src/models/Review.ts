import mongoose, { Schema, Document, models, Types } from 'mongoose';

export interface IReview extends Document {
  tourId: Types.ObjectId;
  userId: Types.ObjectId;
  rating: number;
  comment: string;
}

const ReviewSchema: Schema = new Schema({
  tourId: { type: Schema.Types.ObjectId, ref: 'Tour', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
}, { timestamps: true });

export default models.Review || mongoose.model<IReview>('Review', ReviewSchema);
