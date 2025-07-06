
import mongoose, { Schema, Document, models, Types } from 'mongoose';

export interface IUser extends Document {
  username: string;
  name: string;
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
}

const UserSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
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
}, { timestamps: true });

UserSchema.index({ username: 1 });

export default models.User || mongoose.model<IUser>('User', UserSchema);
