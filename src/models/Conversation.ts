
import mongoose, { Schema, Document, models, Types } from 'mongoose';

export interface IConversation extends Document {
  participants: Types.ObjectId[];
  lastMessage: Types.ObjectId;
}

const ConversationSchema: Schema = new Schema({
  participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
  lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
}, { timestamps: true });

export default models.Conversation || mongoose.model<IConversation>('Conversation', ConversationSchema);
