import mongoose, { Schema, Document, models, Types } from 'mongoose';

export interface IBooking extends Document {
  tourId: Types.ObjectId;
  userId: Types.ObjectId;
  providerId: Types.ObjectId;
  bookingDate: Date;
  numberOfGuests: number;
  totalPrice: number;
  currency: string;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string; // Stripe Session ID or PayPal Order ID
  customerDetails: {
    name: string;
    email: string;
  };
  providerPayoutStatus: 'unpaid' | 'processing' | 'paid';
}

const BookingSchema: Schema = new Schema({
  tourId: { type: Schema.Types.ObjectId, ref: 'Tour', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  providerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  bookingDate: { type: Date, required: true },
  numberOfGuests: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  currency: { type: String, required: true },
  paymentStatus: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
  transactionId: { type: String, unique: true, sparse: true },
  customerDetails: {
    name: { type: String, required: true },
    email: { type: String, required: true },
  },
  providerPayoutStatus: { type: String, enum: ['unpaid', 'processing', 'paid'], default: 'unpaid' },
}, { timestamps: true });

export default models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);
