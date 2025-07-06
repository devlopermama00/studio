
import mongoose, { Schema, Document, models, Types } from 'mongoose';

export interface IBooking extends Document {
  userId: Types.ObjectId;
  tourId: Types.ObjectId;
  bookingDate: Date;
  guests: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'cancellation-requested';
  paymentId: string;
  payoutStatus: 'unpaid' | 'processing' | 'paid';
  paidOutAt?: Date;
  cancellationDetails?: {
      cancelledBy?: 'user' | 'provider' | 'admin';
      cancelledAt?: Date;
      refundRequestedAt?: Date;
      refundProcessedAt?: Date;
      cancellationReason?: string;
      refundEligible?: boolean;
      refundStatus?: 'pending' | 'approved' | 'rejected';
  }
}

const BookingSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  tourId: { type: Schema.Types.ObjectId, ref: 'Tour', required: true },
  bookingDate: { type: Date, required: true },
  guests: { type: Number, required: true, min: 1 },
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed', 'cancellation-requested'], default: 'pending' },
  paymentId: { type: String, required: true },
  payoutStatus: { type: String, enum: ['unpaid', 'processing', 'paid'], default: 'unpaid' },
  paidOutAt: { type: Date },
  cancellationDetails: {
      cancelledBy: { type: String, enum: ['user', 'provider', 'admin'] },
      cancelledAt: { type: Date },
      refundRequestedAt: { type: Date },
      refundProcessedAt: { type: Date },
      cancellationReason: { type: String },
      refundEligible: { type: Boolean },
      refundStatus: { type: String, enum: ['pending', 'approved', 'rejected'] }
  }
}, { timestamps: true });

export default models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);
