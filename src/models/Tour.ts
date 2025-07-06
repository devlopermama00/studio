import mongoose, { Schema, Document, models, Types } from 'mongoose';

interface IItineraryItem {
    title: string;
    description: string;
}

export interface ITour extends Document {
  title: string;
  description: string;
  location: string;
  price: number;
  duration: string;
  category: Types.ObjectId;
  images: string[];
  itinerary: IItineraryItem[];
  createdBy: Types.ObjectId;
  approved: boolean;
}

const ItinerarySchema: Schema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
});

const TourSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: String, required: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  images: [{ type: String }],
  itinerary: [ItinerarySchema],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  approved: { type: Boolean, default: false },
}, { timestamps: true });

export default models.Tour || mongoose.model<ITour>('Tour', TourSchema);