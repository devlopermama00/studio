import mongoose, { Schema, Document, models } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'user' | 'provider' | 'admin';
  bio?: string;
  phone?: string;
  profilePhoto?: string;
  isBlocked: boolean;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user', 'provider', 'admin'], default: 'user' },
  bio: { type: String },
  phone: { type: String },
  profilePhoto: { type: String },
  isBlocked: { type: Boolean, default: false },
}, { timestamps: true });

export default models.User || mongoose.model<IUser>('User', UserSchema);
