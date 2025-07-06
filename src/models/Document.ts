import mongoose, { Schema, Document, models, Types } from 'mongoose';

export interface IDocument extends Document {
  userId: Types.ObjectId;
  licenseUrl: string;
  idProofUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
}

const DocumentSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  licenseUrl: { type: String, required: true },
  idProofUrl: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  submittedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default models.Document || mongoose.model<IDocument>('Document', DocumentSchema);
