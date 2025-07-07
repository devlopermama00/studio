
import mongoose, { Schema, Document, models } from 'mongoose';

export interface ISetting extends Document {
  key: string;
  value: any;
}

const SettingSchema: Schema = new Schema({
  key: { type: String, required: true, unique: true, index: true },
  value: { type: Schema.Types.Mixed, required: true },
}, { timestamps: true });

export default models.Setting || mongoose.model<ISetting>('Setting', SettingSchema);
