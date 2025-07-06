
import mongoose, { Schema, Document, models, Types } from 'mongoose';

export interface IUser extends Document {
  name: string;
  username: string;
  email: string;
  passwordHash: string;
  role: 'user' | 'provider' | 'admin';
  bio?: string;
  phone?: string;
  profilePhoto?: string;
  isBlocked: boolean;
  isVerified: boolean;
  wishlist: Types.ObjectId[];
  forgotPasswordToken?: string;
  forgotPasswordTokenExpiry?: Date;
  currency?: string;
  companyDocumentUrl?: string;
  payoutDetails?: {
    paypalEmail?: string;
    bankDetails?: {
      accountHolderName?: string;
      accountNumber?: string;
      bankName?: string;
      iban?: string;
      swiftCode?: string;
    };
  };
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true, lowercase: true },
  email: { type: String, required: true, unique: true, index: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user', 'provider', 'admin'], default: 'user' },
  bio: { type: String },
  phone: { type: String },
  profilePhoto: { type: String },
  isBlocked: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  wishlist: [{ type: Schema.Types.ObjectId, ref: 'Tour' }],
  forgotPasswordToken: { type: String },
  forgotPasswordTokenExpiry: { type: Date },
  currency: { type: String },
  companyDocumentUrl: { type: String },
  payoutDetails: {
    paypalEmail: { type: String },
    bankDetails: {
      accountHolderName: { type: String },
      accountNumber: { type: String },
      bankName: { type: String },
      iban: { type: String },
      swiftCode: { type: String },
    },
  }
}, { timestamps: true });

export default models.User || mongoose.model<IUser>('User', UserSchema);
