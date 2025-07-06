import mongoose, { Schema, Document, models, Types } from 'mongoose';

export interface IBooking extends Document {
  userId: Types.ObjectId;
  tourId: Types.ObjectId;
  bookingDate: Date;
  guests: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  stripePaymentId: string;
}

const BookingSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  tourId: { type: Schema.Types.ObjectId, ref: 'Tour', required: true },
  bookingDate: { type: Date, required: true },
  guests: { type: Number, required: true, min: 1 },
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending' },
  stripePaymentId: { type: String, required: true },
}, { timestamps: true });

export default models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);
