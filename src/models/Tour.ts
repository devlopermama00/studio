import mongoose, { Schema, Document, models, Types } from 'mongoose';

interface IItineraryItem {
    title: string;
    description: string;
}

export interface ITour extends Document {
  title: string;
  country: string;
  city: string;
  place: string;
  images: string[];
  durationInHours: number;
  currency: string;
  price: number;
  tourType: 'public' | 'private';
  category: Types.ObjectId;
  groupSize: number;
  overview: string;
  languages: string[];
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  importantInformation?: string;
  itinerary: IItineraryItem[];
  createdBy: Types.ObjectId;
  approved: boolean;
  blocked: boolean;
}

const ItinerarySchema: Schema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
});

const TourSchema: Schema = new Schema({
  title: { type: String, required: true },
  country: { type: String, required: true },
  city: { type: String, required: true },
  place: { type: String, required: true },
  images: { type: [{ type: String }], default: [] },
  durationInHours: { type: Number, required: true },
  currency: { type: String, required: true, default: 'USD' },
  price: { type: Number, required: true },
  tourType: { type: String, enum: ['public', 'private'], required: true, default: 'public' },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  groupSize: { type: Number, required: true },
  overview: { type: String, required: true },
  languages: { type: [{ type: String }], default: [] },
  highlights: { type: [{ type: String }], default: [] },
  inclusions: { type: [{ type: String }], default: [] },
  exclusions: { type: [{ type: String }], default: [] },
  importantInformation: { type: String },
  itinerary: [ItinerarySchema],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  approved: { type: Boolean, default: false },
  blocked: { type: Boolean, default: false },
}, { timestamps: true });

export default models.Tour || mongoose.model<ITour>('Tour', TourSchema);